const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    // Handle case where body is a string instead of JSON object
    if (typeof req.body === 'string' || !req.body) {
      console.error('Invalid request body format:', req.body);
      return res.status(400).json({
        error: 'Invalid request format. Expected JSON object with email and password.'
      });
    }

    console.log('Registration request received with body:', JSON.stringify(req.body));

    const { email, password, name, organizationId, role } = req.body;

    // Validate required fields
    if (!email || !password) {
      console.log('Registration failed: Email and password are required');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`Registration failed: Email ${email} already in use`);
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name: name || '',
      organizationId: organizationId || null,
      role: role || 'user'
    });

    // Save user to database
    await user.save();
    console.log(`User registered successfully: ${email}`);

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error(`Registration error: ${error.message}`, error);
    return res.status(500).json({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Login failed: Email and password are required');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log(`Login attempt for email: ${email}`);

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Login failed: No user found with email ${email}`);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`Login failed: Invalid password for ${email}`);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    console.log(`User logged in successfully: ${email}`);

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error(`Login error: ${error.message}`, error);
    return res.status(500).json({ error: error.message });
  }
});

// Refresh token endpoint
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      console.log('Token refresh failed: No refresh token provided');
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      console.log(`Token refresh failed: User not found for token`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`Refreshing token for user: ${user.email}`);

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Generate new refresh token
    const newRefreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error(`Token refresh error: ${error.message}`, error);
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// Get current user information
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log('Get user info failed: No token provided');
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      console.log(`Get user info failed: User not found for token`);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`Retrieved user info for: ${user.email}`);

    return res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId
        }
      }
    });
  } catch (error) {
    console.error(`Get user info error: ${error.message}`, error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;