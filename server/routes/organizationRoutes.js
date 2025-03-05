const express = require('express');
const Organization = require('../models/Organization');
const User = require('../models/User');
const { requireUser } = require('./middleware/auth');
const OrganizationService = require('../services/organizationService');

const router = express.Router();

// User role constants to ensure consistency and prevent typos
const USER_ROLES = {
  ADMIN: 'admin',
  ORGANIZATION_MANAGER: 'organization_manager',
  TEAM_MEMBER: 'team_member'
};

// Create a new organization
router.post('/', requireUser, async (req, res) => {
  try {
    console.log('Organization creation request received:', JSON.stringify(req.body));

    // Check if the user has the admin role
    if (req.user.role !== USER_ROLES.ADMIN) {
      return res.status(403).json({ error: 'Only admins can create organizations' });
    }

    const { name, industry } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Organization name is required' });
    }

    // Create the organization
    const organization = await OrganizationService.create({
      name,
      industry: industry || ''
    });

    console.log(`Organization created by admin: ${req.user.email}`);

    return res.status(201).json({
      success: true,
      data: {
        organization: {
          _id: organization._id,
          name: organization.name,
          industry: organization.industry,
          status: organization.status
        }
      }
    });
  } catch (error) {
    console.error(`Organization creation error: ${error.message}`, error);
    return res.status(500).json({ error: error.message });
  }
});

// Get organizations for the current user
router.get('/', requireUser, async (req, res) => {
  try {
    let organizations = [];

    // If admin, get all organizations
    if (req.user.role === USER_ROLES.ADMIN) {
      organizations = await Organization.find().sort({ createdAt: -1 });
    }
    // If organization_manager or team_member, get their organization
    else if (req.user.organizationId) {
      const organization = await Organization.findById(req.user.organizationId);
      if (organization) {
        organizations = [organization];
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        organizations
      }
    });
  } catch (error) {
    console.error(`Error fetching organizations: ${error.message}`, error);
    return res.status(500).json({ error: error.message });
  }
});

// Update an organization
router.put('/:id', requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, industry } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({ error: 'Organization name is required' });
    }

    // Check if user has permission to update organization
    if (req.user.role !== USER_ROLES.ADMIN &&
        (!req.user.organizationId || req.user.organizationId.toString() !== id)) {
      return res.status(403).json({
        error: 'You do not have permission to update this organization'
      });
    }

    // Update the organization
    const organization = await OrganizationService.update(id, { name, industry });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        organization: {
          _id: organization._id,
          name: organization.name,
          industry: organization.industry,
          status: organization.status
        }
      }
    });
  } catch (error) {
    console.error(`Error updating organization: ${error.message}`, error);
    return res.status(500).json({ error: error.message });
  }
});

// Delete an organization
router.delete('/:id', requireUser, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has permission to delete organization
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

    // If user is deleting their own organization, update their organizationId
    if (req.user.organizationId && req.user.organizationId.toString() === id) {
      await User.findByIdAndUpdate(req.user._id, {
        organizationId: null,
        role: USER_ROLES.TEAM_MEMBER  // Changed from 'user' to 'team_member'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        message: 'Organization deleted successfully'
      }
    });
  } catch (error) {
    console.error(`Error deleting organization: ${error.message}`, error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;