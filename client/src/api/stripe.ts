import api from './api';

// Description: Create a Stripe checkout session
// Endpoint: POST /api/subscription/create-checkout-session
// Request: { planId: string, successUrl: string, cancelUrl: string }
// Response: { success: boolean, data: { sessionId: string, url: string } }
export const createCheckoutSession = async (planId: string) => {
  try {
    const response = await api.post('/api/subscription/create-checkout-session', {
      planId,
      successUrl: `${window.location.origin}/stripe-success`,
      cancelUrl: `${window.location.origin}/register`
    });
    return response.data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Verify a subscription payment
// Endpoint: GET /api/subscription/verify?session_id={sessionId}
// Request: {}
// Response: { success: boolean, data: { verified: boolean, user: { subscriptionStatus: string, paymentVerified: boolean } } }
export const verifySubscriptionPayment = async (sessionId: string) => {
  try {
    const response = await api.get(`/api/subscription/verify?session_id=${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get available subscription plans
// Endpoint: GET /api/subscription/plans
// Request: {}
// Response: { success: boolean, data: { plans: Array<{ id: string, name: string, price: number, features: string[] }> } }
export const getSubscriptionPlans = async () => {
  try {
    console.log('getSubscriptionPlans function called');
    const response = await api.get('/api/subscription/plans');
    console.log('Subscription plans API response:', response.data);

    // Handle different response structures
    if (response.data.data && response.data.data.plans) {
      return response.data;
    } else if (response.data.plans) {
      // For backward compatibility
      return {
        success: response.data.success,
        data: {
          plans: response.data.plans
        }
      };
    } else {
      throw new Error('Invalid response format from subscription plans API');
    }
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Alias for backward compatibility
export const createStripeCheckoutSession = createCheckoutSession;