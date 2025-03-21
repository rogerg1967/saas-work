const express = require('express');
const { requireUser } = require('./middleware/auth');
const StripeService = require('../services/stripeService');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Get available subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await StripeService.getSubscriptionPlans();
    return res.status(200).json({
      success: true,
      data: {
        plans
      }
    });
  } catch (error) {
    console.error(`Error getting subscription plans: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create checkout session for subscription
router.post('/create-checkout-session', requireUser, async (req, res) => {
  try {
    const { planId, successUrl, cancelUrl } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID is required'
      });
    }

    const session = await StripeService.createCheckoutSession(
      req.user._id,
      planId,
      successUrl || `${req.protocol}://${req.get('host')}/subscription/success`,
      cancelUrl || `${req.protocol}://${req.get('host')}/subscription`
    );

    return res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    console.error(`Error creating checkout session: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Verify subscription payment from session ID
router.get('/verify', async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const result = await StripeService.verifySubscriptionPayment(session_id);

    if (result.success && result.user) {
      // Generate authentication tokens for the user
      const accessToken = jwt.sign(
        { userId: result.user._id, email: result.user.email, role: result.user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const refreshToken = jwt.sign(
        { userId: result.user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        success: true,
        data: {
          verified: result.success,
          user: {
            id: result.user._id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
            subscriptionStatus: result.user.subscriptionStatus,
            paymentVerified: result.user.paymentVerified
          },
          accessToken,
          refreshToken
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        verified: result.success,
        user: {
          subscriptionStatus: result.user.subscriptionStatus,
          paymentVerified: result.user.paymentVerified
        }
      }
    });
  } catch (error) {
    console.error(`Error verifying subscription: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get current user's subscription status
router.get('/status', requireUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        subscriptionStatus: user.subscriptionStatus,
        paymentVerified: user.paymentVerified
      }
    });
  } catch (error) {
    console.error(`Error getting subscription status: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;