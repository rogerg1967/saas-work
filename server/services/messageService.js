const mongoose = require('mongoose');
const Message = require('../models/Message');
const path = require('path');
const fs = require('fs');

class MessageService {
  /**
   * Create a new message
   * @param {Object} messageData - The message data
   * @returns {Promise<Object>} The created message
   */
  static async create(messageData) {
    try {
      const message = new Message(messageData);
      await message.save();
      return message;
    } catch (error) {
      console.error(`Error creating message: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Get messages by chatbot ID
   * @param {string} chatbotId - The chatbot ID
   * @returns {Promise<Array>} The messages for the chatbot
   */
  static async getByChatbot(chatbotId) {
    try {
      console.log(`Fetching messages for chatbot: ${chatbotId}`);
      const messages = await Message.find({ chatbotId })
        .sort({ createdAt: 1 })
        .lean();
      return messages;
    } catch (error) {
      console.error(`Error getting messages by chatbot: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Get messages by chatbot ID and thread ID
   * @param {string} chatbotId - The chatbot ID
   * @param {string} threadId - The thread ID
   * @returns {Promise<Array>} The messages for the chatbot and thread
   */
  static async getByChatbotAndThread(chatbotId, threadId) {
    try {
      console.log(`Fetching messages for chatbot: ${chatbotId} and thread: ${threadId}`);
      const messages = await Message.find({ chatbotId, threadId })
        .sort({ timestamp: 1 })
        .lean();
      return messages;
    } catch (error) {
      console.error(`Error getting messages by chatbot and thread: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Get messages by conversation ID
   * @param {string} conversationId - The conversation ID
   * @returns {Promise<Array>} The messages for the conversation
   */
  static async getByConversation(conversationId) {
    try {
      const messages = await Message.find({ conversationId })
        .sort({ createdAt: 1 })
        .lean();
      return messages;
    } catch (error) {
      console.error(`Error getting messages by conversation: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Delete messages by conversation ID
   * @param {string} conversationId - The conversation ID
   * @returns {Promise<Object>} The deletion result
   */
  static async deleteByConversation(conversationId) {
    try {
      const result = await Message.deleteMany({ conversationId });
      return result;
    } catch (error) {
      console.error(`Error deleting messages by conversation: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Save an uploaded image and return the path
   * @param {Object} file - The uploaded file object from multer
   * @returns {Promise<string>} The path to the saved image
   */
  static async saveImage(file) {
    try {
      if (!file) {
        console.log('No image file provided');
        return null;
      }

      console.log(`Saving image: ${file.originalname}`);

      // Get the server URL from environment variable or default to localhost:3000
      const serverURL = process.env.SERVER_URL || 'http://localhost:3000';

      // Check if file has the correct properties
      if (!file.filename) {
        console.error('File object is missing filename property:', file);

        // Use the original filename as a fallback
        const filename = file.originalname ?
          Date.now() + '-' + file.originalname.replace(/\s+/g, '-') :
          Date.now() + '-image';

        console.log(`Generated filename: ${filename}`);

        // The file path where multer saved the file
        const uploadedFilePath = file.path;

        return uploadedFilePath ? `${serverURL}/uploads/${uploadedFilePath.split('uploads\\')[1]}` : null;
      }

      // The file is already saved by multer middleware to the uploads directory
      // We just need to return the full URL path that can be used to access it
      const imagePath = `${serverURL}/uploads/${file.filename}`;

      console.log(`Image saved at path: ${imagePath}`);
      return imagePath;
    } catch (error) {
      console.error(`Error saving image: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Read an image file from the filesystem
   * @param {string} imagePath - The path to the image
   * @returns {Promise<Buffer>} The image data
   */
  static async readImage(imagePath) {
    try {
      // Remove leading slash if present
      const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

      // Get the absolute path to the image
      const absolutePath = path.join(process.cwd(), cleanPath);
      console.log(`Reading image from absolute path: ${absolutePath}`);

      // Check if file exists
      if (!fs.existsSync(absolutePath)) {
        console.log(`Image file not found at path: ${absolutePath}`);
        return null;
      }

      // Read the file
      const imageData = fs.readFileSync(absolutePath);
      return imageData;
    } catch (error) {
      console.error(`Error reading image: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Process a message with an LLM and save response
   * @param {Object} chatbot - The chatbot data
   * @param {string} userId - The user ID
   * @param {string} content - The message content
   * @param {string} imagePath - Optional image path
   * @param {Array} conversationHistory - Previous conversation messages
   * @param {string} threadId - The conversation thread ID
   * @returns {Promise<Object>} The assistant response
   */
  static async processMessage(chatbot, userId, content, imagePath = null, conversationHistory = [], threadId) {
    try {
      console.log(`Processing message for chatbot with ID: ${chatbot._id}`);
      console.log(`Thread ID: ${threadId}`);
      console.log(`Image path: ${imagePath ? imagePath : 'No image'}`);
      console.log(`Using provider: ${chatbot.provider}, model: ${chatbot.model}`);
      console.log(`Conversation history: ${conversationHistory.length} messages`);

      // Make sure we have a valid threadId
      if (!threadId || !mongoose.Types.ObjectId.isValid(threadId)) {
        console.error(`Invalid thread ID: ${threadId}`);
        throw new Error(`Invalid thread ID: ${threadId}`);
      }

      // Create user message
      const userMessage = {
        chatbotId: chatbot._id,
        threadId: threadId,
        userId: userId,
        role: 'user',
        content: content || '',
        image: imagePath || null
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
      let formattedHistory = [];
      if (conversationHistory.length > 0) {
        console.log(`Formatting ${conversationHistory.length} messages for LLM`);
        formattedHistory = this.formatConversationHistoryForLLM(conversationHistory);
        console.log(`Formatted ${formattedHistory.length} messages for conversation history`);
      } else {
        console.log(`No conversation history to format`);
      }

      // Import the LLMService
      const LLMService = require('./llmService');

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
        content: assistantResponse,
        image: null
      };

      const savedAssistantMessage = await this.create(assistantMessage);
      console.log(`Saved assistant message with ID: ${savedAssistantMessage._id}`);

      // Update the thread's last message time
      const ConversationThreadService = require('./conversationThreadService');
      await ConversationThreadService.updateLastMessageTime(threadId);

      return savedAssistantMessage;
    } catch (error) {
      console.error(`Error processing message: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Format conversation history for LLM
   * @param {Array} messages - Previous conversation messages
   * @returns {Array} Formatted messages for LLM
   */
  static formatConversationHistoryForLLM(messages) {
    try {
      console.log(`Formatting ${messages.length} messages for LLM`);

      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Log a sample of the formatted messages
      if (formattedMessages.length > 0) {
        console.log(`History sample (first ${Math.min(3, formattedMessages.length)} messages):`);
        for (let i = 0; i < Math.min(3, formattedMessages.length); i++) {
          console.log(`[${i}] Role: ${formattedMessages[i].role}, Content: ${formattedMessages[i].content.substring(0, 50)}...`);
        }
      }

      return formattedMessages;
    } catch (error) {
      console.error(`Error formatting conversation history: ${error.message}`, error);
      return [];
    }
  }

  /**
   * Get recent conversation history for a chatbot and thread
   * @param {string} chatbotId - The chatbot ID
   * @param {string} threadId - The thread ID
   * @param {number} limit - Maximum number of messages to retrieve (default: 10)
   * @returns {Promise<Array>} List of recent messages
   */
  static async getConversationHistory(chatbotId, threadId, limit = 10) {
    try {
      console.log(`Fetching conversation history for chatbot: ${chatbotId}, thread: ${threadId}, limit: ${limit}`);

      // Make sure threadId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(threadId)) {
        console.error(`Invalid threadId: ${threadId}`);
        throw new Error(`Invalid threadId: ${threadId}`);
      }

      const messages = await Message.find({ chatbotId, threadId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .sort({ timestamp: 1 });

      console.log(`Retrieved ${messages.length} messages for conversation history with thread ${threadId}`);
      return messages;
    } catch (error) {
      console.error(`Error fetching conversation history: ${error.message}`, error);
      throw error;
    }
  }
}

module.exports = MessageService;