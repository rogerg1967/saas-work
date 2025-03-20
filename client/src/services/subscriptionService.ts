import api from '../api/api';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}

export interface SubscriptionPlansResponse {
  success: boolean;
  plans: SubscriptionPlan[];
}

/**
 * Fetches available subscription plans from the server
 * @returns Promise with subscription plans data
 */
export const getSubscriptionPlans = async (): Promise<SubscriptionPlansResponse> => {
  try {
    const response = await api.get('/api/subscription/plans');
    console.log('Fetched subscription plans:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw new Error(error?.response?.data?.error || 'Failed to fetch subscription plans');
  }
};

/**
 * Creates a checkout session for the specified plan
 * @param planId The ID of the subscription plan
 * @param successUrl URL to redirect after successful payment (optional)
 * @param cancelUrl URL to redirect if payment is cancelled (optional)
 * @returns Promise with checkout session URL
 */
export const createCheckoutSession = async (
  planId: string,
  successUrl?: string,
  cancelUrl?: string
) => {
  try {
    const response = await api.post('/api/subscription/create-checkout-session', {
      planId,
      successUrl: successUrl || window.location.origin + '/dashboard',
      cancelUrl: cancelUrl || window.location.origin + '/subscription'
    });
    
    console.log('Created checkout session:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error(error?.response?.data?.error || 'Failed to create checkout session');
  }
};

/**
 * Retrieves the current subscription status for the logged-in user
 * @returns Promise with subscription status data
 */
export const getSubscriptionStatus = async () => {
  try {
    const response = await api.get('/api/subscription/status');
    console.log('Fetched subscription status:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    throw new Error(error?.response?.data?.error || 'Failed to fetch subscription status');
  }
};

/**
 * Cancels the current subscription for the logged-in user
 * @returns Promise with cancellation result
 */
export const cancelSubscription = async () => {
  try {
    const response = await api.post('/api/subscription/cancel');
    console.log('Cancelled subscription:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw new Error(error?.response?.data?.error || 'Failed to cancel subscription');
  }
};