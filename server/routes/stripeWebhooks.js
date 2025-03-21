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
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        endpointSecret
      );
    } else {
      // If no webhook secret is configured, parse the event directly
      // This is less secure but allows testing without webhook signature
      event = JSON.parse(req.body.toString());
      console.warn('⚠️ Webhook signature verification bypassed! Configure STRIPE_WEBHOOK_SECRET for production.');
    }
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`Received Stripe event: ${event.type}`);

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;

        // Ensure we have user metadata
        if (!session.metadata || !session.metadata.userId) {
          console.warn('Checkout session missing userId in metadata:', session.id);
          break;
        }

        const userId = session.metadata.userId;
        console.log(`Processing checkout completion for user: ${userId}`);

        // Find and update user
        const user = await User.findById(userId);
        if (!user) {
          console.error(`User not found: ${userId}`);
          break;
        }

        // Update user subscription details
        user.subscriptionStatus = 'active';
        user.paymentVerified = true;
        user.registrationStatus = 'complete';

        // If there's a subscription ID, save it
        if (session.subscription) {
          user.subscriptionId = session.subscription;
          console.log(`Set subscription ID: ${session.subscription}`);
        }

        await user.save();
        console.log(`✅ User ${user._id} subscription activated`);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        // Find user with this subscription
        const user = await User.findOne({ subscriptionId: subscription.id });
        if (!user) {
          console.warn(`No user found with subscription ID: ${subscription.id}`);
          break;
        }

        user.subscriptionStatus = 'cancelled';
        user.paymentVerified = false;
        await user.save();
        console.log(`✅ User ${user._id} subscription cancelled`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          // Find and update user subscription status
          const user = await User.findOne({ subscriptionId: invoice.subscription });
          if (user) {
            user.subscriptionStatus = 'active';
            user.paymentVerified = true;
            await user.save();
            console.log(`✅ User ${user._id} payment succeeded, subscription confirmed active`);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          // Find and update user subscription status
          const user = await User.findOne({ subscriptionId: invoice.subscription });
          if (user) {
            // Don't immediately cancel, as Stripe will retry payment
            user.paymentVerified = false;
            await user.save();
            console.log(`⚠️ User ${user._id} payment failed`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error processing webhook event ${event.type}:`, error);
    // We return 200 anyway to tell Stripe we received the webhook
    // This prevents Stripe from retrying the webhook unnecessarily
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({received: true});
});

// Helper function to handle subscription updates
async function handleSubscriptionUpdate(subscription) {
  try {
    // Find user with this subscription
    const user = await User.findOne({ subscriptionId: subscription.id });
    if (!user) {
      console.warn(`No user found with subscription ID: ${subscription.id}`);
      return;
    }

    // Map Stripe status to our status
    const statusMap = {
      'active': 'active',
      'trialing': 'active',
      'past_due': 'active', // Still active but payment is overdue
      'unpaid': 'expired',  // Failed to collect payment
      'canceled': 'cancelled',
      'incomplete': 'pending',
      'incomplete_expired': 'expired'
    };

    // Update user status based on subscription status
    if (statusMap[subscription.status]) {
      user.subscriptionStatus = statusMap[subscription.status];
    }

    // Update payment verification based on status
    user.paymentVerified = ['active', 'trialing'].includes(subscription.status);

    await user.save();
    console.log(`✅ User ${user._id} subscription updated to ${user.subscriptionStatus}`);
  } catch (error) {
    console.error(`Error updating subscription:`, error);
  }
}

module.exports = router;