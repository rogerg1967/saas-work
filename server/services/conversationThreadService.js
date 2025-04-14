const ConversationThread = require('../models/ConversationThread');
const Message = require('../models/Message');

class ConversationThreadService {
  /**
   * Create a new conversation thread
   * @param {Object} threadData - The thread data
   * @returns {Promise<Object>} The created thread
   */
  static async create(threadData) {
    try {
      console.log(`Creating new conversation thread for chatbot: ${threadData.chatbotId}`);
      const thread = new ConversationThread(threadData);
      await thread.save();
      console.log(`Successfully created conversation thread with ID: ${thread._id}`);
      return thread;
    } catch (error) {
      console.error(`Error creating conversation thread: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Get threads for a chatbot and user
   * @param {string} chatbotId - The chatbot ID
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} List of threads
   */
  static async getByChatbotAndUser(chatbotId, userId) {
    try {
      console.log(`Fetching conversation threads for chatbot: ${chatbotId} and user: ${userId}`);
      const threads = await ConversationThread.find({ chatbotId, userId })
        .sort({ updatedAt: -1 });
      console.log(`Found ${threads.length} conversation threads`);
      return threads;
    } catch (error) {
      console.error(`Error fetching conversation threads: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Get a thread by ID
   * @param {string} id - The thread ID
   * @returns {Promise<Object>} The thread
   */
  static async getById(id) {
    try {
      console.log(`Fetching conversation thread with ID: ${id}`);
      const thread = await ConversationThread.findById(id);

      if (!thread) {
        console.log(`Conversation thread with ID: ${id} not found`);
        return null;
      }

      console.log(`Successfully retrieved conversation thread: ${thread.name}`);
      return thread;
    } catch (error) {
      console.error(`Error fetching conversation thread: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Update a thread
   * @param {string} id - The thread ID
   * @param {Object} updateData - The update data
   * @returns {Promise<Object>} The updated thread
   */
  static async update(id, updateData) {
    try {
      console.log(`Updating conversation thread with ID: ${id}`);
      const thread = await ConversationThread.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );

      if (!thread) {
        console.log(`Conversation thread with ID: ${id} not found`);
        return null;
      }

      console.log(`Successfully updated conversation thread: ${thread.name}`);
      return thread;
    } catch (error) {
      console.error(`Error updating conversation thread: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Delete a thread and its messages
   * @param {string} id - The thread ID
   * @returns {Promise<Object>} The deletion result
   */
  static async delete(id) {
    try {
      console.log(`Deleting conversation thread with ID: ${id}`);
      const thread = await ConversationThread.findByIdAndDelete(id);

      if (!thread) {
        console.log(`Conversation thread with ID: ${id} not found`);
        return null;
      }

      // Delete all messages in this thread
      await Message.deleteMany({ threadId: id });
      console.log(`Successfully deleted conversation thread: ${thread.name} and its messages`);
      return thread;
    } catch (error) {
      console.error(`Error deleting conversation thread: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Get or create a default thread for a chatbot and user
   * @param {string} chatbotId - The chatbot ID
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} The thread
   */
  static async getOrCreateDefault(chatbotId, userId) {
    try {
      console.log(`Getting or creating default thread for chatbot: ${chatbotId} and user: ${userId}`);

      // Try to find an existing thread
      let thread = await ConversationThread.findOne({
        chatbotId,
        userId,
        isActive: true
      }).sort({ updatedAt: -1 });

      // If no thread exists, create a new one
      if (!thread) {
        thread = await this.create({
          chatbotId,
          userId,
          name: 'New Conversation',
          isActive: true
        });
        console.log(`Created new default thread with ID: ${thread._id}`);
      } else {
        console.log(`Found existing thread with ID: ${thread._id}`);
      }

      return thread;
    } catch (error) {
      console.error(`Error getting or creating default thread: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Update the last message timestamp for a thread
   * @param {string} id - The thread ID
   * @returns {Promise<Object>} The updated thread
   */
  static async updateLastMessageTime(id) {
    try {
      console.log(`Updating last message time for thread: ${id}`);
      const thread = await ConversationThread.findByIdAndUpdate(
        id,
        {
          $set: {
            lastMessageAt: new Date(),
            updatedAt: new Date()
          }
        },
        { new: true }
      );

      if (!thread) {
        console.log(`Conversation thread with ID: ${id} not found`);
        return null;
      }

      console.log(`Successfully updated last message time for thread: ${thread.name}`);
      return thread;
    } catch (error) {
      console.error(`Error updating last message time: ${error.message}`, error);
      throw error;
    }
  }
}

module.exports = ConversationThreadService;