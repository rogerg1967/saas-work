const express = require('express');
const { requireUser } = require('./middleware/auth');
const StripeService = require('../services/stripeService');
const SubscriptionService = require('../services/subscriptionService');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Get available subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await StripeService.getSubscriptionPlans();
    return res.status(200).json({
      success: true,
      plans
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

/**
 * @route GET /api/subscription/status
 * @desc Get user's subscription status
 * @access Private
 */
router.get('/status', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(`Fetching subscription status for user: ${userId}`);
    const subscriptionStatus = await SubscriptionService.getSubscriptionStatus(userId);

    return res.json({
      success: true,
      data: subscriptionStatus
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/subscription/details
 * @desc Get detailed subscription information
 * @access Private
 */
router.get('/details', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(`Fetching detailed subscription information for user: ${userId}`);
    const subscriptionDetails = await SubscriptionService.getSubscriptionDetails(userId);

    return res.json({
      success: true,
      data: subscriptionDetails
    });
  } catch (error) {
    console.error('Error getting subscription details:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user's invoices
router.get('/invoices', requireUser, async (req, res) => {
  try {
    const invoices = await SubscriptionService.getUserInvoices(req.user._id);

    return res.status(200).json({
      success: true,
      data: {
        invoices
      }
    });
  } catch (error) {
    console.error(`Error getting user invoices: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Cancel user's subscription
router.post('/cancel', requireUser, async (req, res) => {
  try {
    const result = await SubscriptionService.suspendSubscription(req.user._id);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error(`Error cancelling subscription: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;