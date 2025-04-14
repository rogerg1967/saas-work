const Message = require('../models/Message');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const LLMService = require('./llmService');
const ConversationThreadService = require('./conversationThreadService');

class MessageService {
  /**
   * Save a message to the database
   * @param {Object} messageData - The message data
   * @returns {Promise<Object>} The saved message
   */
  static async create(messageData) {
    try {
      console.log(`Creating new message for chatbot: ${messageData.chatbotId}, thread: ${messageData.threadId}`);
      const message = new Message(messageData);
      await message.save();

      // Update the last message time for the thread
      await ConversationThreadService.updateLastMessageTime(messageData.threadId);

      console.log(`Successfully created message with ID: ${message._id}`);
      return message;
    } catch (error) {
      console.error(`Error creating message: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Get messages for a chatbot thread
   * @param {string} chatbotId - The chatbot ID
   * @param {string} threadId - The thread ID
   * @returns {Promise<Array>} List of messages
   */
  static async getByThread(chatbotId, threadId) {
    try {
      console.log(`Fetching messages for chatbot: ${chatbotId}, thread: ${threadId}`);
      const messages = await Message.find({ chatbotId, threadId }).sort({ timestamp: 1 });
      console.log(`Found ${messages.length} messages for thread ${threadId}`);
      return messages;
    } catch (error) {
      console.error(`Error fetching messages: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Get recent conversation history for a thread
   * @param {string} chatbotId - The chatbot ID
   * @param {string} threadId - The thread ID
   * @param {number} limit - Maximum number of messages to retrieve (default: 10)
   * @returns {Promise<Array>} List of recent messages
   */
  static async getConversationHistory(chatbotId, threadId, limit = 10) {
    try {
      console.log(`Fetching conversation history for chatbot: ${chatbotId}, thread: ${threadId}, limit: ${limit}`);
      const messages = await Message.find({ chatbotId, threadId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .sort({ timestamp: 1 });

      console.log(`Retrieved ${messages.length} messages for conversation history`);
      return messages;
    } catch (error) {
      console.error(`Error fetching conversation history: ${error.message}`, error);
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
   * @param {string} threadId - The conversation thread ID
   * @param {string} content - The message content
   * @param {string} userId - The user ID
   * @param {string} imagePath - Optional image path
   * @param {Array} conversationHistory - Previous conversation messages
   * @returns {Promise<Object>} The assistant response
   */
  static async processMessage(chatbot, threadId, content, userId, imagePath = null, conversationHistory = []) {
    try {
      console.log(`Processing message for chatbot with ID: ${chatbot._id}, thread: ${threadId}`);
      console.log(`Image path: ${imagePath ? imagePath : 'No image'}`);
      console.log(`Using provider: ${chatbot.provider}, model: ${chatbot.model}`);
      console.log(`Conversation history: ${conversationHistory.length} messages`);

      // Create user message
      const userMessage = {
        chatbotId: chatbot._id,
        threadId: threadId,
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
        threadId: threadId,
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