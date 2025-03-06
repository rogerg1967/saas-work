const express = require('express');
const { requireUser } = require('./middleware/auth');
const Organization = require('../models/Organization');
const User = require('../models/User');
const OrganizationService = require('../services/organizationService');
const UserService = require('../services/userService');

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

// Get all users for admin
router.get('/users', requireUser, async (req, res) => {
  try {
    console.log('Admin users fetch request received', { userId: req.user._id });

    // Validate user is admin
    if (req.user.role !== USER_ROLES.ADMIN) {
      console.log('Access denied - non-admin user attempted to access admin route', {
        userId: req.user._id,
        userRole: req.user.role
      });
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    // Get all users with their organization
    const users = await User.find()
      .select('-password')
      .populate('organizationId', 'name industry status')
      .lean();

    console.log(`Found ${users.length} users for admin view`);

    // Format the response
    const formattedUsers = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization: user.organizationId ? {
        _id: user.organizationId._id,
        name: user.organizationId.name,
        industry: user.organizationId.industry,
        status: user.organizationId.status
      } : null
    }));

    console.log('Successfully fetched all users for admin view');
    return res.status(200).json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Error fetching users for admin:', error);
    return res.status(500).json({ error: error.message || 'An unexpected error occurred while fetching users' });
  }
});

// Update organization status
router.put('/organizations/:id/status', requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('Admin organization status update request received', {
      userId: req.user._id,
      organizationId: id,
      newStatus: status
    });

    // Validate user is admin
    if (req.user.role !== USER_ROLES.ADMIN) {
      console.log('Access denied - non-admin user attempted to update organization status', {
        userId: req.user._id,
        userRole: req.user.role,
        organizationId: id
      });
      return res.status(403).json({ error: 'Only admins can update organization status' });
    }

    // Validate status value
    const validStatuses = ['active', 'inactive', 'pending', 'suspended'];
    if (!validStatuses.includes(status)) {
      console.log('Invalid status value provided', {
        providedStatus: status,
        validStatuses
      });
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Update the organization
    const organization = await Organization.findByIdAndUpdate(
      id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!organization) {
      console.log('Organization not found for status update', { organizationId: id });
      return res.status(404).json({ error: 'Organization not found' });
    }

    console.log('Successfully updated organization status', {
      organizationId: id,
      organizationName: organization.name,
      oldStatus: organization.status,
      newStatus: status
    });

    return res.status(200).json({
      success: true,
      organization
    });
  } catch (error) {
    console.error('Error updating organization status:', error);
    return res.status(500).json({ error: error.message || 'An unexpected error occurred while updating organization status' });
  }
});

// Delete an organization (admin only)
router.delete('/organizations/:id', requireUser, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is an admin
    if (req.user.role !== USER_ROLES.ADMIN) {
      return res.status(403).json({
        error: 'Only admins can delete organizations'
      });
    }

    // Find all users in this organization
    const usersInOrg = await User.find({ organizationId: id });
    console.log(`Found ${usersInOrg.length} users in organization ${id}`);

    // Update all users in the organization to have null organizationId
    if (usersInOrg.length > 0) {
      await User.updateMany(
        { organizationId: id },
        {
          $set: {
            organizationId: null,
            role: USER_ROLES.TEAM_MEMBER
          }
        }
      );
      console.log(`Updated ${usersInOrg.length} users: removed organization and set role to team_member`);
    }

    // Delete the organization
    const result = await OrganizationService.delete(id);

    if (!result) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Organization deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting organization: ${error.message}`, error);
    return res.status(500).json({ error: error.message });
  }
});

// Update user role
router.put('/users/:id/role', requireUser, async (req, res) => {
  try {
    console.log('Admin user role update request received', {
      userId: req.user._id,
      targetUserId: req.params.id,
      newRole: req.body.role
    });

    if (req.user.role !== USER_ROLES.ADMIN) {
      console.log('Access denied - non-admin user attempted to update user role', {
        userId: req.user._id,
        userRole: req.user.role,
        targetUserId: req.params.id
      });
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      console.log('Missing role in request body', { userId: req.params.id });
      return res.status(400).json({ error: 'Role is required' });
    }

    // Check if the role is valid
    const validRoles = Object.values(USER_ROLES);
    if (!validRoles.includes(role)) {
      console.log('Invalid role value provided', {
        providedRole: role,
        validRoles
      });
      return res.status(400).json({
        error: `Invalid role. Role must be one of: ${validRoles.join(', ')}`
      });
    }

    const user = await UserService.get(id);
    if (!user) {
      console.log('User not found for role update', { userId: id });
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Updating user role', {
      userId: id,
      currentRole: user.role,
      newRole: role
    });

    // Update the user's role
    const updatedUser = await UserService.update(id, { role });

    console.log('Successfully updated user role', {
      userId: updatedUser._id,
      userName: updatedUser.name,
      oldRole: user.role,
      newRole: updatedUser.role
    });

    return res.status(200).json({
      success: true,
      user: {
        _id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        organizationId: updatedUser.organizationId
      }
    });
  } catch (error) {
    console.error(`Error updating user role: ${error.message}`, error);
    return res.status(500).json({ error: error.message });
  }
});

// Delete a user (admin only)
router.delete('/users/:id', requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Admin user deletion request received', {
      adminUserId: req.user._id,
      targetUserId: id
    });

    // Check if user is an admin
    if (req.user.role !== USER_ROLES.ADMIN) {
      console.log('Access denied - non-admin user attempted to delete a user', {
        userId: req.user._id,
        userRole: req.user.role,
        targetUserId: id
      });
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === id) {
      console.log('Admin attempted to delete their own account', { adminId: id });
      return res.status(400).json({ error: 'You cannot delete your own admin account' });
    }

    // Delete the user
    const result = await UserService.delete(id);

    if (!result) {
      console.log('User not found for deletion', { userId: id });
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User successfully deleted', { deletedUserId: id });
    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting user: ${error.message}`, error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;