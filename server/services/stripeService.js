let stripe;
try {
  stripe = process.env.STRIPE_SECRET_KEY
    ? require('stripe')(process.env.STRIPE_SECRET_KEY)
    : null;
} catch (error) {
  console.warn('Stripe initialization failed:', error.message);
  console.warn('Stripe functionality will be disabled');
  stripe = null;
}

const User = require('../models/User');

class StripeService {
  static async createCheckoutSession(userId, planId, successUrl, cancelUrl) {
    try {
      if (!stripe) {
        console.warn('Stripe is not initialized. Returning mock checkout session');
        return {
          id: 'mock_session_' + Date.now(),
          url: successUrl + '?session_id=mock_session_' + Date.now(),
        };
      }

      console.log(`Creating checkout session for user: ${userId}, plan: ${planId}`);

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Create a checkout session with the selected plan
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: user.email,
        line_items: [
          {
            price: planId, // Stripe price ID
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        metadata: {
          userId: userId,
        },
      });

      // Update user's subscription status to pending
      user.subscriptionStatus = 'pending';
      await user.save();

      console.log(`Checkout session created: ${session.id}`);
      return session;
    } catch (error) {
      console.error(`Error creating checkout session: ${error.message}`);
      throw new Error(`Failed to create checkout session: ${error.message}`);
    }
  }

  static async verifySubscriptionPayment(sessionId) {
    try {
      if (!stripe) {
        console.warn('Stripe is not initialized. Returning mock verification');
        return {
          success: true,
          user: await User.findByIdAndUpdate(
            sessionId.split('_').pop(),
            {
              subscriptionStatus: 'active',
              paymentVerified: true
            },
            { new: true }
          )
        };
      }

      console.log(`Verifying subscription payment for session: ${sessionId}`);

      // Retrieve the checkout session from Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (!session || session.payment_status !== 'paid') {
        throw new Error('Payment not completed or session invalid');
      }

      const userId = session.metadata.userId;

      // Update user's subscription status
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.subscriptionStatus = 'active';
      user.subscriptionId = session.subscription;
      user.paymentVerified = true;
      await user.save();

      console.log(`Payment verified for user: ${userId}`);
      return { success: true, user };
    } catch (error) {
      console.error(`Error verifying subscription: ${error.message}`);
      throw new Error(`Failed to verify subscription: ${error.message}`);
    }
  }

  static async getSubscriptionPlans() {
    try {
      if (!stripe) {
        console.warn('Stripe is not initialized. Returning mock plans');
        return [
          {
            id: 'price_basic',
            name: 'Basic Plan',
            description: 'Basic features for small teams',
            price: 9.99,
            currency: 'usd',
            interval: 'month',
            features: ['Up to 3 chatbots', 'Basic analytics', 'Email support']
          },
          {
            id: 'price_pro',
            name: 'Pro Plan',
            description: 'Advanced features for growing teams',
            price: 29.99,
            currency: 'usd',
            interval: 'month',
            features: ['Unlimited chatbots', 'Advanced analytics', 'Priority support']
          }
        ];
      }

      console.log('Fetching subscription plans');

      // Fetch all available price objects from Stripe
      const prices = await stripe.prices.list({
        active: true,
        limit: 100,
        expand: ['data.product'],
      });

      // Map the prices to a more usable format
      const plans = prices.data.map(price => ({
        id: price.id,
        name: price.product.name,
        description: price.product.description,
        price: price.unit_amount / 100, // Convert from cents to dollars/pounds
        currency: price.currency,
        interval: price.recurring?.interval || 'month',
        features: price.product.metadata.features ?
          JSON.parse(price.product.metadata.features) : [],
      }));

      return plans;
    } catch (error) {
      console.error(`Error fetching subscription plans: ${error.message}`);
      throw new Error(`Failed to fetch subscription plans: ${error.message}`);
    }
  }
}

module.exports = StripeService;