const express = require('express');
const { requireUser } = require('./middleware/auth');
const Organization = require('../models/Organization');
const User = require('../models/User');

const router = express.Router();

// Constants for user roles
const USER_ROLES = {
  ADMIN: 'admin',
  ORGANIZATION_MANAGER: 'organization_manager',
  TEAM_MEMBER: 'team_member'
};

// Get all organizations for admin view
// GET /api/admin/organizations
router.get('/organizations', requireUser, async (req, res) => {
  try {
    console.log('Admin organization fetch request received', { userId: req.user._id });
    
    // Check if the user is an admin
    if (req.user.role !== USER_ROLES.ADMIN) {
      console.log('Access denied - non-admin user attempted to access admin route', { 
        userId: req.user._id, 
        userRole: req.user.role 
      });
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    // Fetch all organizations
    const organizations = await Organization.find().sort({ createdAt: -1 });
    console.log(`Found ${organizations.length} organizations`);

    // For each organization, find the associated users
    const orgsWithUsers = await Promise.all(
      organizations.map(async (org) => {
        const users = await User.find({ organizationId: org._id })
          .select('_id name email role');
        
        console.log(`Found ${users.length} users for organization ${org.name} (${org._id})`);

        return {
          _id: org._id,
          name: org.name,
          status: org.status,
          industry: org.industry,
          users: users
        };
      })
    );

    console.log('Successfully fetched all organizations with users for admin view');
    return res.status(200).json({
      success: true,
      organizations: orgsWithUsers
    });
  } catch (error) {
    console.error('Error fetching organizations for admin:', error);
    return res.status(500).json({ error: error.message || 'An unexpected error occurred while fetching organizations' });
  }
});

module.exports = router;