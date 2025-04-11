const Message = require('../models/Message');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const LLMService = require('./llmService');

class MessageService {
  /**
   * Save a message to the database
   * @param {Object} messageData - The message data
   * @returns {Promise<Object>} The saved message
   */
  static async create(messageData) {
    try {
      console.log(`Creating new message for chatbot: ${messageData.chatbotId}`);
      const message = new Message(messageData);
      await message.save();
      console.log(`Successfully created message with ID: ${message._id}`);
      return message;
    } catch (error) {
      console.error(`Error creating message: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Get messages for a chatbot
   * @param {string} chatbotId - The chatbot ID
   * @returns {Promise<Array>} List of messages
   */
  static async getByChatbot(chatbotId) {
    try {
      console.log(`Fetching messages for chatbot: ${chatbotId}`);
      const messages = await Message.find({ chatbotId }).sort({ timestamp: 1 });
      console.log(`Found ${messages.length} messages for chatbot ${chatbotId}`);
      return messages;
    } catch (error) {
      console.error(`Error fetching messages for chatbot ${chatbotId}: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Save an image and return the path
   * @param {Object} file - The uploaded file
   * @returns {Promise<string>} The image path
   */
  static async saveImage(file) {
    try {
      if (!file) return null;

      const uploadsDir = path.join(__dirname, '../uploads');

      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const filename = `${uuidv4()}-${file.originalname}`;
      const filepath = path.join(uploadsDir, filename);

      // Write file
      await fs.promises.writeFile(filepath, file.buffer);

      // Return relative path to be stored in the database
      return `/uploads/${filename}`;
    } catch (error) {
      console.error(`Error saving image: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Process a message with an LLM and save response
   * @param {Object} chatbot - The chatbot data
   * @param {string} content - The message content
   * @param {string} userId - The user ID
   * @param {string} imagePath - Optional image path
   * @returns {Promise<Object>} The assistant response
   */
  static async processMessage(chatbot, content, userId, imagePath = null) {
    try {
      console.log(`Processing message for chatbot with ID: ${chatbot._id}`);
      console.log(`Image path: ${imagePath ? imagePath : 'No image'}`);

      // Create user message
      const userMessage = {
        chatbotId: chatbot._id,
        userId: userId,
        role: 'user',
        content: content,
        image: imagePath
      };

      const savedUserMessage = await this.create(userMessage);

      // Prepare message prompt
      let prompt = content || '';

      // If content is empty but there's an image, add a default prompt
      if (!content && imagePath) {
        prompt = "Please analyze this image and tell me what you see.";
      }

      // Process with LLM
      const assistantResponse = await LLMService.sendLLMRequest(
        chatbot.provider,
        chatbot.model,
        prompt,
        imagePath  // Pass the image path to LLM service
      );

      // Create assistant message
      const assistantMessage = {
        chatbotId: chatbot._id,
        userId: userId,
        role: 'assistant',
        content: assistantResponse
      };

      const savedAssistantMessage = await this.create(assistantMessage);

      return savedAssistantMessage;
    } catch (error) {
      console.error(`Error processing message: ${error.message}`, error);
      throw error;
    }
  }
}

module.exports = MessageService;