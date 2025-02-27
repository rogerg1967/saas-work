const express = require('express');
const UserService = require('../services/userService.js');
const { requireUser } = require('./middleware/auth.js');
const { generateAccessToken, generateRefreshToken } = require('../utils/auth.js');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');

const router = express.Router();

router.post('/login', async (req, res) => {
  const sendError = msg => res.status(400).json({ error: msg });
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError('Email and password are required');
  }

  try {
    const user = await UserService.authenticateWithPassword(email, password);

    if (user) {
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

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
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt
          },
          accessToken,
          refreshToken
        }
      });
    } else {
      return sendError('Email or password is incorrect');
    }
  } catch (error) {
    console.error(`Login error: ${error.message}`);
    return res.status(500).json({ error: `Login error: ${error.message}` });
  }
});

router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received with body:', JSON.stringify(req.body));

    const { email, password, name, organizationId, role } = req.body;

    // Validate required fields
    if (!email || !password) {
      console.log('Registration failed: Email and password are required');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Log what we're trying to create
    console.log(`Attempting to create user with email: ${email}, name: ${name || ''}, organizationId: ${organizationId || 'null'}, role: ${role || 'team_member'}`);

    const user = await UserService.create({
      email,
      password,
      name: name || '',
      organizationId,
      role: role || 'team_member' // Default role if not provided
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update user with refresh token
    user.refreshToken = refreshToken;
    await user.save();

    console.log(`User registered successfully with ID: ${user._id}`);

    // Return user data along with tokens
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
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error(`Registration error: ${error.message}`);
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
    console.error(`Logout error: ${error.message}`);
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
    console.error(`Token refresh error: ${error.message}`);

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
    return res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error(`Get user profile error: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;