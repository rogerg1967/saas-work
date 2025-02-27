const express = require('express');
const User = require('../models/User');
let stripe;

try {
  stripe = process.env.STRIPE_SECRET_KEY
    ? require('stripe')(process.env.STRIPE_SECRET_KEY)
    : null;
} catch (error) {
  console.warn('Stripe initialization failed:', error.message);
  console.warn('Stripe webhook functionality will be disabled');
  stripe = null;
}

const router = express.Router();

// Stripe webhook endpoint
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  if (!stripe) {
    console.warn('Stripe is not initialized. Skipping webhook processing');
    return res.status(200).json({received: true, warning: 'Stripe not initialized'});
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;

      // Update user subscription status
      if (session.metadata && session.metadata.userId) {
        try {
          const user = await User.findById(session.metadata.userId);
          if (user) {
            user.subscriptionStatus = 'active';
            user.subscriptionId = session.subscription;
            user.paymentVerified = true;
            await user.save();
            console.log(`User ${user._id} subscription activated`);
          }
        } catch (error) {
          console.error(`Error updating user subscription: ${error.message}`);
        }
      }
      break;

    case 'customer.subscription.updated':
      const subscription = event.data.object;
      try {
        // Find user with this subscription
        const user = await User.findOne({ subscriptionId: subscription.id });
        if (user) {
          // Update status based on subscription status
          if (subscription.status === 'active') {
            user.subscriptionStatus = 'active';
          } else if (subscription.status === 'canceled') {
            user.subscriptionStatus = 'cancelled';
          } else if (subscription.status === 'unpaid' || subscription.status === 'past_due') {
            user.paymentVerified = false;
          }
          await user.save();
          console.log(`User ${user._id} subscription updated to ${user.subscriptionStatus}`);
        }
      } catch (error) {
        console.error(`Error updating subscription: ${error.message}`);
      }
      break;

    case 'customer.subscription.deleted':
      const cancelledSubscription = event.data.object;
      try {
        // Find user with this subscription
        const user = await User.findOne({ subscriptionId: cancelledSubscription.id });
        if (user) {
          user.subscriptionStatus = 'cancelled';
          user.paymentVerified = false;
          await user.save();
          console.log(`User ${user._id} subscription cancelled`);
        }
      } catch (error) {
        console.error(`Error cancelling subscription: ${error.message}`);
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({received: true});
});

module.exports = router;