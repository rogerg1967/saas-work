import api from './api';

// Description: Get current user's subscription status
// Endpoint: GET /api/subscription/status
// Request: {}
// Response: { success: boolean, data: { subscriptionStatus: string, paymentVerified: boolean, subscription: Object, subscriptionId: string } }
export const getSubscriptionStatus = async () => {
  try {
    const response = await api.get('/api/subscription/status');
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get detailed subscription information
// Endpoint: GET /api/subscription/details
// Request: {}
// Response: { success: boolean, data: { subscriptionStatus: string, subscriptionId: string, paymentVerified: boolean, subscription: Object, customerId: string } }
export const getSubscriptionDetails = async () => {
  try {
    const response = await api.get('/api/subscription/details');
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get user's invoices
// Endpoint: GET /api/subscription/invoices
// Request: {}
// Response: { success: boolean, data: { invoices: Array<{ invoiceId: string, amount: number, currency: string, status: string, date: string, pdfUrl: string }> } }
export const getInvoices = async () => {
  try {
    const response = await api.get('/api/subscription/invoices');
    return response.data;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Cancel user's subscription
// Endpoint: POST /api/subscription/cancel
// Request: {}
// Response: { success: boolean, data: { subscriptionStatus: string, cancelAtPeriodEnd: boolean, currentPeriodEnd: string } }
export const cancelSubscription = async () => {
  try {
    const response = await api.post('/api/subscription/cancel');
    return response.data;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};