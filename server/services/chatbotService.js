const Chatbot = require('../models/Chatbot');
const User = require('../models/User');
const Message = require('../models/Message');

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

  /**
   * Update a chatbot
   * @param {string} id - Chatbot ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated chatbot
   */
  static async update(id, updateData) {
    try {
      console.log(`Updating chatbot with ID: ${id}`);
      const chatbot = await Chatbot.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );

      if (!chatbot) {
        console.log(`Chatbot with ID: ${id} not found for update`);
        return null;
      }

      console.log(`Successfully updated chatbot: ${chatbot.name}`);
      return chatbot;
    } catch (error) {
      console.error(`Error updating chatbot: ${error.message}`, error);
      throw new Error(`Failed to update chatbot: ${error.message}`);
    }
  }

  /**
   * Update a chatbot
   * @param {string} id - The ID of the chatbot to update
   * @param {Object} chatbotData - The updated chatbot data
   * @returns {Promise<Object>} - The updated chatbot
   */
  static async updateChatbot(id, chatbotData) {
    try {
      console.log(`Updating chatbot with ID: ${id}`);

      // Find the chatbot
      const chatbot = await Chatbot.findById(id);

      if (!chatbot) {
        const error = new Error('Chatbot not found');
        error.statusCode = 404;
        throw error;
      }

      // Check if user has permission to update this chatbot
      const user = await User.findById(chatbotData.userId);
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      // Only allow update if user is admin or belongs to the same organization as the chatbot
      if (user.role !== 'admin' && chatbot.organizationId.toString() !== user.organizationId.toString()) {
        const error = new Error('Not authorized to update this chatbot');
        error.statusCode = 403;
        throw error;
      }

      // Update the chatbot fields
      chatbot.name = chatbotData.name;
      chatbot.description = chatbotData.description;
      chatbot.model = chatbotData.model;
      chatbot.provider = chatbotData.provider;

      // Save the updated chatbot
      await chatbot.save();
      console.log(`Chatbot ${id} updated successfully`);

      return chatbot;
    } catch (error) {
      console.error(`Error updating chatbot ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a chatbot
   * @param {string} id - The ID of the chatbot to delete
   * @param {string} userId - The ID of the user attempting to delete the chatbot
   * @returns {Promise<void>}
   */
  static async deleteChatbot(id, userId) {
    try {
      console.log(`Deleting chatbot with ID: ${id}`);

      // Find the chatbot
      const chatbot = await Chatbot.findById(id);

      if (!chatbot) {
        const error = new Error('Chatbot not found');
        error.statusCode = 404;
        throw error;
      }

      // Check if user has permission to delete this chatbot
      const user = await User.findById(userId);
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }

      // Only allow delete if user is admin or belongs to the same organization as the chatbot
      if (user.role !== 'admin' && chatbot.organizationId.toString() !== user.organizationId.toString()) {
        const error = new Error('Not authorized to delete this chatbot');
        error.statusCode = 403;
        throw error;
      }

      // Delete the chatbot
      await Chatbot.findByIdAndDelete(id);

      // Also delete all messages associated with this chatbot
      await Message.deleteMany({ chatbotId: id });

      console.log(`Chatbot ${id} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting chatbot ${id}:`, error);
      throw error;
    }
  }
}

module.exports = ChatbotService;