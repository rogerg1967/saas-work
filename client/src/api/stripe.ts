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
// Endpoint: GET /api/subscription/plans
// Request: {}
// Response: { plans: Array<{ id: string, name: string, price: number, features: string[] }> }
export const getSubscriptionPlans = async () => {
  try {
    const response = await api.get('/api/subscription/plans');
    return response.data.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};