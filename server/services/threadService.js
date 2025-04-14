const ChatThread = require('../models/ChatThread');
const Message = require('../models/Message');

class ThreadService {
  /**
   * Create a new chat thread
   * @param {Object} threadData - The thread data
   * @returns {Promise<Object>} The created thread
   */
  static async create(threadData) {
    try {
      console.log(`Creating new chat thread for chatbot: ${threadData.chatbotId}`);
      const thread = new ChatThread(threadData);
      await thread.save();
      console.log(`Successfully created chat thread with ID: ${thread._id}`);
      return thread;
    } catch (error) {
      console.error(`Error creating chat thread: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Get threads for a chatbot
   * @param {string} chatbotId - The chatbot ID
   * @param {string} userId - The user ID
   * @returns {Promise<Array>} List of threads
   */
  static async getByChatbot(chatbotId, userId) {
    try {
      console.log(`Fetching threads for chatbot: ${chatbotId} and user: ${userId}`);
      const threads = await ChatThread.find({
        chatbotId,
        userId
      }).sort({ updatedAt: -1 });
      console.log(`Found ${threads.length} threads for chatbot ${chatbotId}`);
      return threads;
    } catch (error) {
      console.error(`Error fetching threads for chatbot ${chatbotId}: ${error.message}`, error);
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
      console.log(`Fetching thread with ID: ${id}`);
      const thread = await ChatThread.findById(id);

      if (!thread) {
        console.log(`Thread with ID: ${id} not found`);
        return null;
      }

      console.log(`Successfully retrieved thread: ${thread.name}`);
      return thread;
    } catch (error) {
      console.error(`Error fetching thread with ID ${id}: ${error.message}`, error);
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
      console.log(`Updating thread with ID: ${id}`);
      const thread = await ChatThread.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );

      if (!thread) {
        console.log(`Thread with ID: ${id} not found for update`);
        return null;
      }

      console.log(`Successfully updated thread: ${thread.name}`);
      return thread;
    } catch (error) {
      console.error(`Error updating thread: ${error.message}`, error);
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
      console.log(`Deleting thread with ID: ${id}`);

      // Delete the thread
      const result = await ChatThread.findByIdAndDelete(id);

      if (!result) {
        console.log(`Thread with ID: ${id} not found for deletion`);
        return null;
      }

      // Delete all messages in the thread
      await Message.deleteMany({ threadId: id });

      console.log(`Successfully deleted thread: ${result.name} and its messages`);
      return result;
    } catch (error) {
      console.error(`Error deleting thread with ID ${id}: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Update thread with last message information
   * @param {string} threadId - The thread ID
   * @param {string} lastMessage - The last message content
   * @returns {Promise<Object>} The updated thread
   */
  static async updateLastMessage(threadId, lastMessage) {
    try {
      console.log(`Updating last message for thread: ${threadId}`);

      const thread = await ChatThread.findByIdAndUpdate(
        threadId,
        {
          $set: {
            lastMessage: lastMessage.substring(0, 100), // Store a preview of the message
            lastMessageAt: new Date()
          }
        },
        { new: true }
      );

      if (!thread) {
        console.log(`Thread with ID: ${threadId} not found for last message update`);
        return null;
      }

      console.log(`Successfully updated last message for thread: ${thread.name}`);
      return thread;
    } catch (error) {
      console.error(`Error updating last message: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Check if a user has access to a thread
   * @param {string} userId - The user ID
   * @param {Object} thread - The thread object
   * @returns {Promise<boolean>} Whether the user has access
   */
  static async userHasAccess(userId, thread) {
    try {
      console.log(`Checking if user ${userId} has access to thread ${thread._id}`);

      // Fetch the user
      const User = require('../models/User');
      const user = await User.findById(userId);

      if (!user) {
        console.log(`User ${userId} not found`);
        return false;
      }

      // Admin users have access to all threads
      if (user.role === 'admin') {
        console.log(`User ${userId} is an admin, access granted`);
        return true;
      }

      // Check if the user is the owner of the thread
      const hasAccess = thread.userId.toString() === userId.toString();

      console.log(`User ${userId} ${hasAccess ? 'has' : 'does not have'} access to thread ${thread._id}`);
      return hasAccess;
    } catch (error) {
      console.error(`Error checking user access: ${error.message}`, error);
      return false;
    }
  }
}

module.exports = ThreadService;