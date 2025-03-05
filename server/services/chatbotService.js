const Chatbot = require('../models/Chatbot');

class ChatbotService {
  /**
   * Create a new chatbot
   * @param {Object} chatbotData - The chatbot data
   * @returns {Promise<Object>} The created chatbot
   */
  static async create(chatbotData) {
    try {
      console.log(`Creating new chatbot: ${chatbotData.name}`);
      const chatbot = new Chatbot(chatbotData);
      await chatbot.save();
      console.log(`Successfully created chatbot with ID: ${chatbot._id}`);
      return chatbot;
    } catch (error) {
      console.error(`Error creating chatbot: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Get chatbots for an organization
   * @param {string} organizationId - The organization ID
   * @returns {Promise<Array>} List of chatbots
   */
  static async getByOrganization(organizationId) {
    try {
      console.log(`Fetching chatbots for organization: ${organizationId}`);
      const chatbots = await Chatbot.find({ organizationId });
      console.log(`Found ${chatbots.length} chatbots for organization ${organizationId}`);
      return chatbots;
    } catch (error) {
      console.error(`Error fetching chatbots for organization ${organizationId}: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Get a chatbot by ID
   * @param {string} id - The chatbot ID
   * @returns {Promise<Object>} The chatbot
   */
  static async getById(id) {
    try {
      console.log(`Fetching chatbot with ID: ${id}`);
      const chatbot = await Chatbot.findById(id);
      
      if (!chatbot) {
        console.log(`Chatbot with ID: ${id} not found`);
        return null;
      }
      
      console.log(`Successfully retrieved chatbot: ${chatbot.name}`);
      return chatbot;
    } catch (error) {
      console.error(`Error fetching chatbot with ID ${id}: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Delete a chatbot
   * @param {string} id - The chatbot ID
   * @returns {Promise<Object>} The deletion result
   */
  static async delete(id) {
    try {
      console.log(`Deleting chatbot with ID: ${id}`);
      const result = await Chatbot.findByIdAndDelete(id);
      
      if (!result) {
        console.log(`Chatbot with ID: ${id} not found for deletion`);
        return null;
      }
      
      console.log(`Successfully deleted chatbot: ${result.name}`);
      return result;
    } catch (error) {
      console.error(`Error deleting chatbot with ID ${id}: ${error.message}`, error);
      throw error;
    }
  }
}

module.exports = ChatbotService;