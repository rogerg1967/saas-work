const express = require('express');
const UserService = require('../services/userService.js');
const OrganizationService = require('../services/organizationService.js');
const { requireUser } = require('./middleware/auth.js');
const { generateAccessToken, generateRefreshToken } = require('../utils/auth.js');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const User = require('../models/User.js');
const { validatePassword, generatePasswordHash } = require('../utils/password.js');

const router = express.Router();

router.post('/login', async (req, res) => {
  const sendError = msg => res.status(400).json({ error: msg });
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError('Email and password are required');
  }

  try {
    console.log(`Authenticating user with email: ${email}`);
    const user = await UserService.authenticateWithPassword(email, password);

    if (user) {
      console.log(`Authentication successful for user: ${email}`);
      const accessToken = generateAccessToken(user);
      console.log(`Generated access token for user: ${email}`);
      const refreshToken = generateRefreshToken(user);
      console.log(`Generated refresh token for user: ${email}`);

      user.refreshToken = refreshToken;
      await user.save();

      // Return user data along with tokens
      return res.status(200).json({
        success: true,
        data: {
          user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            organizationId: user.organizationId,
            isActive: user.isActive,
            subscriptionStatus: user.subscriptionStatus,
            paymentVerified: user.paymentVerified,
            registrationStatus: user.registrationStatus,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt
          },
          accessToken,
          refreshToken
        }
      });
    } else {
      console.log(`Authentication failed: Invalid credentials for ${email}`);
      return sendError('Email or password is incorrect');
    }
  } catch (error) {
    console.error(`Login error: ${error.message}`, error);
    return res.status(500).json({ error: `Login error: ${error.message}` });
  }
});

router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received with body:', JSON.stringify(req.body));

    const { email, password, name, organization, role } = req.body;

    // Validate required fields
    if (!email || !password) {
      console.log('Registration failed: Email and password are required');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await UserService.getByEmail(email);

    // If user exists but registration is incomplete, update the existing user
    if (existingUser) {
      if (existingUser.registrationStatus === 'incomplete' ||
          existingUser.subscriptionStatus === 'none' ||
          existingUser.subscriptionStatus === 'pending') {

        console.log(`User ${email} exists with incomplete registration. Updating user data.`);

        // Update user data
        existingUser.name = name || existingUser.name;
        existingUser.password = await generatePasswordHash(password);
        existingUser.registrationStatus = 'payment_pending';

        // If organization info was provided, update or create organization
        let updatedOrganization = null;
        if (organization && organization.name) {
          if (existingUser.organizationId) {
            // Update existing organization
            try {
              updatedOrganization = await OrganizationService.update(
                existingUser.organizationId,
                {
                  name: organization.name,
                  industry: organization.industry || ''
                }
              );
            } catch (orgError) {
              console.error(`Failed to update organization: ${orgError.message}`, orgError);
            }
          } else {
            // Create new organization
            try {
              updatedOrganization = await OrganizationService.create({
                name: organization.name,
                industry: organization.industry || ''
              });

              // Update user role and organization
              existingUser.role = 'organization_manager';
              existingUser.organizationId = updatedOrganization._id;
            } catch (orgError) {
              console.error(`Failed to create organization: ${orgError.message}`, orgError);
              return res.status(400).json({ error: `Organization creation failed: ${orgError.message}` });
            }
          }
        }

        await existingUser.save();

        // Generate tokens
        const accessToken = generateAccessToken(existingUser);
        const refreshToken = generateRefreshToken(existingUser);

        // Update user with refresh token
        existingUser.refreshToken = refreshToken;
        await existingUser.save();

        return res.status(200).json({
          success: true,
          data: {
            user: {
              _id: existingUser._id,
              email: existingUser.email,
              name: existingUser.name,
              role: existingUser.role,
              organizationId: existingUser.organizationId,
              isActive: existingUser.isActive,
              subscriptionStatus: existingUser.subscriptionStatus,
              paymentVerified: existingUser.paymentVerified,
              registrationStatus: existingUser.registrationStatus,
              createdAt: existingUser.createdAt,
              lastLoginAt: existingUser.lastLoginAt
            },
            organization: updatedOrganization ? {
              _id: updatedOrganization._id,
              name: updatedOrganization.name,
              industry: updatedOrganization.industry,
              status: updatedOrganization.status
            } : undefined,
            accessToken,
            refreshToken
          }
        });
      } else {
        console.log(`Registration failed: Email ${email} already in use`);
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Check if organization info was provided
    let createdOrganization = null;
    let assignedRole = role || 'team_member';

    if (organization && organization.name) {
      try {
        console.log(`Creating new organization: ${organization.name}`);
        createdOrganization = await OrganizationService.create({
          name: organization.name,
          industry: organization.industry || ''
        });

        // If organization is created, user becomes organization_manager by default
        assignedRole = 'organization_manager';
        console.log(`Organization "${organization.name}" created successfully with ID: ${createdOrganization._id}`);
        console.log(`Created organization: ${createdOrganization.name} with ID: ${createdOrganization._id}`);
      } catch (orgError) {
        console.error(`Failed to create organization: ${orgError.message}`, orgError);
        return res.status(400).json({ error: `Organization creation failed: ${orgError.message}` });
      }
    }

    // Log what we're trying to create
    console.log(`Attempting to create user with email: ${email}, name: ${name || ''}, organizationId: ${createdOrganization?._id || 'null'}, role: ${assignedRole}`);

    console.log(`Creating new user with email: ${email}`);
    const user = await UserService.create({
      email,
      password,
      name: name || '',
      organizationId: createdOrganization?._id,
      role: assignedRole,
      subscriptionStatus: 'none',
      paymentVerified: false,
      registrationStatus: 'payment_pending'
    });

    console.log(`Fetching user with email: ${email}`);
    console.log(`User ${email} created successfully`);

    // Generate tokens
    console.log(`Generating access token for user: ${email}`);
    const accessToken = generateAccessToken(user);
    console.log(`Generating refresh token for user: ${email}`);
    const refreshToken = generateRefreshToken(user);

    // Update user with refresh token
    user.refreshToken = refreshToken;
    await user.save();

    console.log(`User registered successfully with ID: ${user._id}`);

    // Return user data along with organization and tokens
    return res.status(201).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          isActive: user.isActive,
          subscriptionStatus: user.subscriptionStatus,
          paymentVerified: user.paymentVerified,
          registrationStatus: user.registrationStatus,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt
        },
        organization: createdOrganization ? {
          _id: createdOrganization._id,
          name: createdOrganization.name,
          industry: createdOrganization.industry,
          status: createdOrganization.status
        } : undefined,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error(`Registration error: ${error.message}`, error);
    return res.status(400).json({ error: error.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    let email;

    // Check if the body is a string or an object with email property
    if (typeof req.body === 'string') {
      try {
        // Try to parse as JSON if it's a string
        const parsedBody = JSON.parse(req.body);
        email = parsedBody.email;
      } catch (parseError) {
        // If parsing fails, assume the string is the email itself
        email = req.body;
      }
    } else {
      // If it's already an object, get the email property
      email = req.body.email;
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log(`Logging out user with email: ${email}`);

    const user = await UserService.getByEmail(email);
    if (user) {
      user.refreshToken = randomUUID();
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: 'User logged out successfully.'
    });
  } catch (error) {
    console.error(`Logout error: ${error.message}`, error);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      error: 'Refresh token is required'
    });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Find the user
    const user = await UserService.get(decoded.sub);

    if (!user) {
      return res.status(403).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.refreshToken !== refreshToken) {
      return res.status(403).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update user's refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    // Return new tokens
    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error(`Token refresh error: ${error.message}`, error);

    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        error: 'Refresh token has expired'
      });
    }

    return res.status(403).json({
      success: false,
      error: 'Invalid refresh token'
    });
  }
});

router.get('/me', requireUser, async (req, res) => {
  try {
    // Get fresh user data to include subscription status
    const user = await UserService.get(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          isActive: user.isActive,
          subscriptionStatus: user.subscriptionStatus,
          paymentVerified: user.paymentVerified,
          registrationStatus: user.registrationStatus,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt
        }
      }
    });
  } catch (error) {
    console.error(`Get user profile error: ${error.message}`, error);
    return res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', requireUser, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user._id;

    // Validate inputs
    if (!name && !email) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update provided'
      });
    }

    // Check if email is already in use by another user
    if (email && email !== req.user.email) {
      const existingUser = await UserService.getByEmail(email);
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        return res.status(400).json({
          success: false,
          error: 'Email is already in use by another account'
        });
      }
    }

    // Update user
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const updatedUser = await UserService.update(userId, updateData);

    return res.status(200).json({
      success: true,
      data: {
        user: {
          _id: updatedUser._id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          organizationId: updatedUser.organizationId,
          isActive: updatedUser.isActive,
          subscriptionStatus: updatedUser.subscriptionStatus,
          paymentVerified: updatedUser.paymentVerified,
          registrationStatus: updatedUser.registrationStatus,
          createdAt: updatedUser.createdAt,
          lastLoginAt: updatedUser.lastLoginAt
        }
      }
    });
  } catch (error) {
    console.error(`Profile update error: ${error.message}`, error);
    return res.status(500).json({ error: error.message });
  }
});

// Request password reset (generates token)
router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const user = await UserService.getByEmail(email);
    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive password reset instructions.'
      });
    }

    // Generate reset token
    const resetToken = randomUUID();
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Token valid for 1 hour

    // Save token to user
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // In a real application, you would send an email with the reset link
    // For this implementation, we'll just return the token in the response
    // This would normally be sent via email with a link to a reset page

    return res.status(200).json({
      success: true,
      message: 'If your email is registered, you will receive password reset instructions.',
      // Include token in response for demonstration purposes
      // In production, remove this and send via email
      data: {
        resetToken
      }
    });
  } catch (error) {
    console.error(`Password reset request error: ${error.message}`, error);
    return res.status(500).json({ error: error.message });
  }
});

// Reset password using token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: 'Token and new password are required'
      });
    }

    // Find user with this token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Password reset token is invalid or has expired'
      });
    }

    // Set new password
    await UserService.setPassword(user, password);

    // Clear reset token
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully.'
    });
  } catch (error) {
    console.error(`Password reset error: ${error.message}`, error);
    return res.status(500).json({ error: error.message });
  }
});

// Change password (when user knows current password)
router.post('/change-password', requireUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
    }

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const isValid = await validatePassword(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Set new password
    await UserService.setPassword(user, newPassword);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error(`Change password error: ${error.message}`, error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;