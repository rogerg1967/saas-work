import api from './api';

// Description: Update user profile
// Endpoint: PUT /api/auth/profile
// Request: { name?: string, email?: string }
// Response: { success: boolean, data: { user: User } }
export const updateUserProfile = async (data: { name?: string; email?: string }) => {
  try {
    const response = await api.put('/api/auth/profile', data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Change password
// Endpoint: POST /api/auth/change-password
// Request: { currentPassword: string, newPassword: string }
// Response: { success: boolean, message: string }
export const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
  try {
    const response = await api.post('/api/auth/change-password', data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Request password reset
// Endpoint: POST /api/auth/request-password-reset
// Request: { email: string }
// Response: { success: boolean, message: string, data?: { resetToken: string } }
export const requestPasswordReset = async (data: { email: string }) => {
  try {
    const response = await api.post('/api/auth/request-password-reset', data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Reset password using token
// Endpoint: POST /api/auth/reset-password
// Request: { token: string, password: string }
// Response: { success: boolean, message: string }
export const resetPassword = async (data: { token: string; password: string }) => {
  try {
    const response = await api.post('/api/auth/reset-password', data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};