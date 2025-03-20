const express = require('express');
const { requireUser } = require('./middleware/auth.js');
const ActiveUserService = require('../services/activeUserService.js');

const router = express.Router();

// Record user activity
router.post('/activity', requireUser, (req, res) => {
  try {
    console.log(`Recording activity for user: ${req.user._id}`);
    ActiveUserService.recordUserActivity(req.user._id);
    return res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error('Error recording user activity:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get active users count
router.get('/count', requireUser, async (req, res) => {
  try {
    console.log(`User ${req.user._id} requesting active users count`);
    // Only admins and organization managers can see active users count
    if (req.user.role !== 'admin' && req.user.role !== 'organization_manager') {
      console.log(`User ${req.user._id} with role ${req.user.role} denied access to active users count`);
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view active users'
      });
    }

    const count = ActiveUserService.getActiveUsersCount();
    console.log(`Active users count: ${count}`);

    return res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error getting active users count:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get active users details
router.get('/', requireUser, async (req, res) => {
  try {
    console.log(`User ${req.user._id} requesting active users details`);
    // Only admins and organization managers can see active users
    if (req.user.role !== 'admin' && req.user.role !== 'organization_manager') {
      console.log(`User ${req.user._id} with role ${req.user.role} denied access to active users details`);
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to view active users'
      });
    }

    const users = await ActiveUserService.getActiveUsers();
    console.log(`Retrieved ${users.length} active users`);

    return res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error getting active users:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;