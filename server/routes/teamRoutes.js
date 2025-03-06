const express = require('express');
const { requireUser } = require('./middleware/auth.js');
const TeamService = require('../services/teamService.js');

const router = express.Router();

// User role constants
const USER_ROLES = {
  ADMIN: 'admin',
  ORGANIZATION_MANAGER: 'organization_manager',
  TEAM_MEMBER: 'team_member'
};

// Middleware to verify if user can manage team
const canManageTeam = (req, res, next) => {
  const userRole = req.user.role;

  if (userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.ORGANIZATION_MANAGER) {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: 'You do not have permission to manage team members'
  });
};

// Get team members for the current user's organization
router.get('/', requireUser, async (req, res) => {
  try {
    let members = [];

    // Check if the user has an organization
    if (!req.user.organizationId) {
      return res.status(400).json({
        success: false,
        error: 'You are not associated with any organization'
      });
    }

    // Get team members from the user's organization
    members = await TeamService.getMembers(req.user.organizationId);

    // Map to the required response format and exclude sensitive information
    const formattedMembers = members.map(member => ({
      _id: member._id,
      name: member.name,
      role: member.role,
      email: member.email,
      phone: member.metadata?.phone || '',
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(member.name)}`
    }));

    return res.status(200).json({
      success: true,
      members: formattedMembers
    });
  } catch (error) {
    console.error(`Error fetching team members: ${error.message}`, error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create a new team member
router.post('/', requireUser, canManageTeam, async (req, res) => {
  try {
    const { name, role, email, phone } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    // Check if user has an organization
    if (!req.user.organizationId) {
      return res.status(400).json({
        success: false,
        error: 'You must be part of an organization to add team members'
      });
    }

    // Create a new team member
    const newMember = await TeamService.createMember({
      name,
      email,
      role: 'team_member', // Force role to team_member for security
      phone,
      organizationId: req.user.organizationId,
      createdBy: req.user._id
    });

    return res.status(201).json({
      success: true,
      member: {
        _id: newMember._id,
        name: newMember.name,
        role: newMember.role,
        email: newMember.email,
        phone: newMember.metadata?.phone || '',
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newMember.name)}`
      }
    });
  } catch (error) {
    console.error(`Error creating team member: ${error.message}`, error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update an existing team member
router.put('/:id', requireUser, canManageTeam, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, email, phone } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    // Update the team member
    const updatedMember = await TeamService.updateMember(id, {
      name,
      role: 'team_member', // Force role to team_member for security
      email,
      phone
    });

    if (!updatedMember) {
      return res.status(404).json({
        success: false,
        error: 'Team member not found'
      });
    }

    return res.status(200).json({
      success: true,
      member: {
        _id: updatedMember._id,
        name: updatedMember.name,
        role: updatedMember.role,
        email: updatedMember.email,
        phone: updatedMember.metadata?.phone || '',
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(updatedMember.name)}`
      }
    });
  } catch (error) {
    console.error(`Error updating team member: ${error.message}`, error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete a team member
router.delete('/:id', requireUser, canManageTeam, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the team member
    const result = await TeamService.deleteMember(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Team member not found'
      });
    }

    return res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error(`Error deleting team member: ${error.message}`, error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;