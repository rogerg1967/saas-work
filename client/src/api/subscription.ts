import api from './api';

// Description: Get current user's subscription status
// Endpoint: GET /api/subscription/status
// Request: {}
// Response: { success: boolean, data: { subscriptionStatus: string, paymentVerified: boolean } }
export const getSubscriptionStatus = async () => {
  try {
    const response = await api.get('/api/subscription/status');
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};