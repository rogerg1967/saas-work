import api from './api';

// Description: Create a Stripe checkout session
// Endpoint: POST /api/subscription/create-checkout-session
// Request: { planId: string }
// Response: { success: boolean, url: string }
export const createCheckoutSession = async (planId: string) => {
  try {
    const response = await api.post('/api/subscription/create-checkout-session', {
      planId,
      successUrl: `${window.location.origin}/dashboard`,
      cancelUrl: `${window.location.origin}/subscription`
    });
    return response.data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get available subscription plans
// Endpoint: GET /api/subscription/plans
// Request: {}
// Response: { success: boolean, plans: Array<{ id: string, name: string, price: number, features: string[] }> }
export const getSubscriptionPlans = async () => {
  try {
    const response = await api.get('/api/subscription/plans');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Alias for backward compatibility
export const createStripeCheckoutSession = createCheckoutSession;