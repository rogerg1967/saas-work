import api from './api';

// Description: Create Stripe checkout session
// Endpoint: POST /api/stripe/create-checkout-session
// Request: {}
// Response: { success: boolean, url: string }
export const createStripeCheckoutSession = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        url: '/subscription'
      });
    }, 500);
  });
};

// Description: Get subscription plans
// Endpoint: GET /api/stripe/plans
// Request: {}
// Response: { plans: Array<{ id: string, name: string, price: number, features: string[] }> }
export const getSubscriptionPlans = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        plans: [
          {
            id: 'basic',
            name: 'Basic',
            price: 29,
            features: ['5 Chatbots', '1,000 Messages/mo', 'Email Support']
          },
          {
            id: 'pro',
            name: 'Professional',
            price: 99,
            features: ['Unlimited Chatbots', 'Unlimited Messages', '24/7 Support', 'Custom Branding']
          },
          {
            id: 'enterprise',
            name: 'Enterprise',
            price: 299,
            features: ['Everything in Pro', 'Dedicated Account Manager', 'Custom Integration', 'SLA Guarantee']
          }
        ]
      });
    }, 500);
  });
};