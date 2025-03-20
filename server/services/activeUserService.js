// server/services/activeUserService.js
class ActiveUserService {
  // Store active users in memory with their last activity timestamp
  static activeUsers = new Map();

  // Record user activity
  static recordUserActivity(userId) {
    if (!userId) {
      console.log('Attempted to record activity for undefined userId');
      return;
    }

    this.activeUsers.set(userId.toString(), Date.now());
    console.log(`Recorded activity for user: ${userId}`);

    // Clean up inactive users (inactive for more than 15 minutes)
    this.cleanupInactiveUsers();
  }

  // Get count of active users
  static getActiveUsersCount() {
    this.cleanupInactiveUsers();
    console.log(`Current active users count: ${this.activeUsers.size}`);
    return this.activeUsers.size;
  }

  // Get active users with details
  static async getActiveUsers() {
    const User = require('../models/User.js');
    this.cleanupInactiveUsers();

    try {
      // Get user details for active users
      const userIds = Array.from(this.activeUsers.keys());
      if (userIds.length === 0) {
        console.log('No active users found');
        return [];
      }

      console.log(`Fetching details for ${userIds.length} active users`);
      const users = await User.find({ _id: { $in: userIds } })
        .select('name email role organizationId lastLoginAt')
        .lean();

      console.log(`Retrieved ${users.length} user details from database`);

      return users.map(user => ({
        ...user,
        lastActivity: this.activeUsers.get(user._id.toString())
      }));
    } catch (error) {
      console.error('Error fetching active users:', error);
      return [];
    }
  }

  // Clean up users who haven't been active in the last 15 minutes
  static cleanupInactiveUsers() {
    const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
    let removedCount = 0;

    for (const [userId, lastActivity] of this.activeUsers.entries()) {
      if (lastActivity < fifteenMinutesAgo) {
        this.activeUsers.delete(userId);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`Cleaned up ${removedCount} inactive users`);
    }
  }
}

module.exports = ActiveUserService;