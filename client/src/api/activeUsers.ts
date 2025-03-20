import api from './api';

// Description: Get active users count
// Endpoint: GET /api/active-users/count
// Request: {}
// Response: { success: boolean, count: number }
export const getActiveUsersCount = async () => {
  try {
    const response = await api.get('/api/active-users/count');
    return response.data;
  } catch (error) {
    console.error('Error fetching active users count:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get active users details
// Endpoint: GET /api/active-users
// Request: {}
// Response: { success: boolean, users: Array<{ _id: string, name: string, email: string, role: string, lastActivity: number }> }
export const getActiveUsers = async () => {
  try {
    const response = await api.get('/api/active-users');
    return response.data;
  } catch (error) {
    console.error('Error fetching active users:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Record user activity
// Endpoint: POST /api/active-users/activity
// Request: {}
// Response: { success: boolean }
export const recordActivity = async () => {
  try {
    const response = await api.post('/api/active-users/activity');
    return response.data;
  } catch (error) {
    console.error('Error recording activity:', error);
    // Silently fail - this is a background operation
    return { success: false };
  }
};