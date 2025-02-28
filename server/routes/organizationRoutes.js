const express = require('express');
const Organization = require('../models/Organization');
const User = require('../models/User');
const { requireUser } = require('./middleware/auth');
const OrganizationService = require('../services/organizationService');

const router = express.Router();

// Create a new organization
router.post('/', requireUser, async (req, res) => {
  try {
    console.log('Organization creation request received:', JSON.stringify(req.body));

    const { name, industry } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Organization name is required' });
    }

    // Create the organization
    const organization = await OrganizationService.create({
      name,
      industry: industry || ''
    });

    // Update the user's organizationId and role
    await User.findByIdAndUpdate(req.user._id, {
      organizationId: organization._id,
      role: 'organization_manager'
    });

    console.log(`Organization created and linked to user: ${req.user.email}`);

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
    console.error(`Organization creation error: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
});

// Get organizations for the current user
router.get('/', requireUser, async (req, res) => {
  try {
    let organizations = [];

    // If admin, get all organizations
    if (req.user.role === 'admin') {
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
    console.error(`Error fetching organizations: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;