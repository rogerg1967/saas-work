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
   * Get recent conversation history for a chatbot
   * @param {string} chatbotId - The chatbot ID
   * @param {number} limit - Maximum number of messages to retrieve (default: 10)
   * @returns {Promise<Array>} List of recent messages
   */
  static async getConversationHistory(chatbotId, limit = 10) {
    try {
      console.log(`Fetching conversation history for chatbot: ${chatbotId}, limit: ${limit}`);
      const messages = await Message.find({ chatbotId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .sort({ timestamp: 1 });

      console.log(`Retrieved ${messages.length} messages for conversation history`);
      return messages;
    } catch (error) {
      console.error(`Error fetching conversation history for chatbot ${chatbotId}: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Format conversation history for LLM context
   * @param {Array} messages - List of message objects
   * @returns {Array} Formatted messages for LLM
   */
  static formatConversationHistoryForLLM(messages) {
    return messages.map(message => ({
      role: message.role,
      content: message.content,
      // Include image reference if it exists
      ...(message.image && { image: message.image })
    }));
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
      console.log(`Using provider: ${chatbot.provider}, model: ${chatbot.model}`);

      // Create user message
      const userMessage = {
        chatbotId: chatbot._id,
        userId: userId,
        role: 'user',
        content: content,
        image: imagePath
      };

      const savedUserMessage = await this.create(userMessage);
      console.log(`Saved user message with ID: ${savedUserMessage._id}`);

      // Prepare message prompt
      let prompt = content || '';

      // If content is empty but there's an image, add a default prompt
      if (!content && imagePath) {
        prompt = "Please analyze this image and tell me what you see.";
        console.log(`Using default prompt for image-only message: "${prompt}"`);
      }

      // Get conversation history
      const historyLimit = chatbot.historyLimit || 10; // Default to 10 if not specified
      console.log(`Fetching conversation history with limit: ${historyLimit}`);
      const conversationHistory = await this.getConversationHistory(chatbot._id, historyLimit);

      // Format history for LLM
      const formattedHistory = this.formatConversationHistoryForLLM(conversationHistory);
      console.log(`Formatted ${formattedHistory.length} messages for conversation history`);

      // Process with LLM including conversation history
      console.log(`Sending request to LLM service with conversation history and image: ${imagePath ? 'Yes' : 'No'}`);
      const assistantResponse = await LLMService.sendLLMRequestWithHistory(
        chatbot.provider,
        chatbot.model,
        prompt,
        formattedHistory,
        imagePath  // Pass the image path to LLM service
      );

      console.log(`Received response from LLM service: ${assistantResponse.substring(0, 100)}...`);

      // Create assistant message
      const assistantMessage = {
        chatbotId: chatbot._id,
        userId: userId,
        role: 'assistant',
        content: assistantResponse
      };

      const savedAssistantMessage = await this.create(assistantMessage);
      console.log(`Saved assistant message with ID: ${savedAssistantMessage._id}`);

      return savedAssistantMessage;
    } catch (error) {
      console.error(`Error processing message: ${error.message}`, error);
      throw error;
    }
  }
}

module.exports = MessageService;