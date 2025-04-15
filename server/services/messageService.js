const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Message = require('../models/Message');
const { sendLLMRequest } = require('./llmService');

class MessageService {
  /**
   * Save an uploaded image to the file system
   * @param {Object} file - The uploaded file object from multer
   * @returns {Promise<string>} - The path where the image was saved
   */
  static async saveImage(file) {
    try {
      console.log(`Saving file: ${file.originalname}, size: ${file.size}, type: ${file.mimetype}`);

      // If the file was already saved by multer (using diskStorage)
      if (file.path) {
        console.log(`File already saved by multer at ${file.path}`);
        return file.path;
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        console.log('Creating uploads directory');
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate a unique filename
      const fileName = `${uuidv4()}-${file.originalname}`;
      const filePath = path.join(uploadsDir, fileName);

      // Write the file to disk
      console.log(`Writing file to ${filePath}`);
      await fs.promises.writeFile(filePath, file.buffer);

      console.log(`File saved successfully at ${filePath}`);
      return filePath;
    } catch (error) {
      console.error(`Error saving file: ${error.message}`, error);
      throw new Error(`Failed to save file: ${error.message}`);
    }
  }

  /**
   * Save an uploaded document to the file system
   * @param {Object} file - The uploaded file object from multer
   * @returns {Promise<string>} - The path where the document was saved
   */
  static async saveDocument(file) {
    // Currently this uses the same implementation as saveImage
    // but we can customize it for documents in the future if needed
    return this.saveImage(file);
  }

  /**
   * Get the file type (image or document) based on MIME type
   * @param {string} mimetype - The MIME type of the file
   * @returns {string} - Either 'image' or 'document'
   */
  static getFileType(mimetype) {
    if (mimetype.startsWith('image/')) {
      return 'image';
    }
    return 'document';
  }

  /**
   * Process uploaded file (either image or document)
   * @param {Object} file - The uploaded file object from multer
   * @returns {Promise<Object>} - Object containing the file path and type
   */
  static async processFile(file) {
    if (!file) {
      console.log('No file to process');
      return { filePath: null, fileType: null };
    }

    const fileType = this.getFileType(file.mimetype);
    console.log(`Processing file as ${fileType}`);

    let filePath;
    if (fileType === 'image') {
      filePath = await this.saveImage(file);
    } else {
      filePath = await this.saveDocument(file);
    }

    return { filePath, fileType };
  }

  /**
   * Get conversation history for a chatbot and thread
   * @param {string} chatbotId - The ID of the chatbot
   * @param {string} threadId - The ID of the conversation thread
   * @param {number} limit - Maximum number of messages to retrieve
   * @returns {Promise<Array>} - Array of messages
   */
  static async getConversationHistory(chatbotId, threadId, limit = 10) {
    try {
      console.log(`Retrieving conversation history for chatbot ${chatbotId} and thread ${threadId} with limit ${limit}`);

      // Get messages from the database
      const messages = await Message.getByChatbotAndThread(chatbotId, threadId, limit);

      console.log(`Retrieved ${messages.length} messages for conversation history`);

      // Format messages for LLM context
      return messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
    } catch (error) {
      console.error(`Error retrieving conversation history: ${error.message}`, error);
      throw new Error(`Failed to retrieve conversation history: ${error.message}`);
    }
  }

  /**
   * Process a message and get a response from the AI
   * @param {Object} chatbot - The chatbot object
   * @param {string} userId - The ID of the user sending the message
   * @param {string} messageContent - The message content
   * @param {string} filePath - Path to an uploaded file (optional)
   * @param {Array} conversationHistory - Previous messages in the conversation
   * @param {string} threadId - The ID of the conversation thread
   * @returns {Promise<Object>} - The response message
   */
  static async processMessage(chatbot, userId, messageContent, filePath, conversationHistory, threadId) {
    try {
      console.log(`Processing message for chatbot ${chatbot._id} from user ${userId}`);

      // Determine if we have an image or document
      let fileType = null;
      if (filePath) {
        const mimetype = path.extname(filePath).toLowerCase();
        fileType = mimetype.match(/\.(jpg|jpeg|png|gif)$/i) ? 'image' : 'document';
        console.log(`File detected as ${fileType}: ${filePath}`);
      }

      // Save the user message to the database
      const userMessage = new Message({
        chatbotId: chatbot._id,
        threadId: threadId,
        userId: userId,
        role: 'user',
        content: messageContent,
        [fileType === 'image' ? 'image' : 'document']: filePath ? filePath : undefined
      });

      await userMessage.save();
      console.log(`Saved user message with ID: ${userMessage._id}`);

      // Prepare the message for the AI
      let aiPrompt = messageContent;

      // Send the message to the AI and get a response
      const aiResponse = await sendLLMRequest(
        chatbot.provider,
        chatbot.model,
        aiPrompt,
        conversationHistory,
        filePath
      );

      console.log(`Received AI response: ${aiResponse.substring(0, 50)}...`);

      // Save the AI response to the database
      const assistantMessage = new Message({
        chatbotId: chatbot._id,
        threadId: threadId,
        userId: userId,
        role: 'assistant',
        content: aiResponse
      });

      await assistantMessage.save();
      console.log(`Saved assistant message with ID: ${assistantMessage._id}`);

      // Return the assistant message
      return assistantMessage;
    } catch (error) {
      console.error(`Error processing message: ${error.message}`, error);
      throw new Error(`Failed to process message: ${error.message}`);
    }
  }
}

module.exports = MessageService;