import api from './api';

// Description: Get all organizations for admin
// Endpoint: GET /api/admin/organizations
// Request: {}
// Response: { organizations: Array<{ _id: string, name: string, status: string, industry: string, users: Array<{ _id: string, name: string, email: string, role: string }> }> }
export const getAdminOrganizations = async () => {
  try {
    const response = await api.get('/api/admin/organizations');
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update organization status
// Endpoint: PUT /api/admin/organizations/:id/status
// Request: { status: string }
// Response: { success: boolean, organization: { _id: string, name: string, industry: string, status: string } }
export const updateOrganizationStatus = async (id: string, status: string) => {
  try {
    const response = await api.put(`/api/admin/organizations/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete organization
// Endpoint: DELETE /api/admin/organizations/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteOrganization = async (id: string) => {
  try {
    const response = await api.delete(`/api/admin/organizations/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting organization:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get all users
// Endpoint: GET /api/admin/users
// Request: {}
// Response: { users: Array<{ _id: string, name: string, email: string, role: string, organization: { _id: string, name: string } }> }
export const getAdminUsers = async () => {
  try {
    const response = await api.get('/api/admin/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin users:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update user role
// Endpoint: PUT /api/admin/users/:id/role
// Request: { role: string }
// Response: { success: boolean, user: { _id: string, email: string, name: string, role: string, organizationId: string } }
export const updateUserRole = async (id: string, role: string) => {
  try {
    const response = await api.put(`/api/admin/users/${id}/role`, { role });
    return response.data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete user
// Endpoint: DELETE /api/admin/users/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteUser = async (id: string) => {
  try {
    const response = await api.delete(`/api/admin/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update user details
// Endpoint: PUT /api/admin/users/:id
// Request: { name?: string, email?: string, role?: string, organizationId?: string | null }
// Response: { success: boolean, user: { _id: string, email: string, name: string, role: string, organizationId: string | null } }
export const updateUser = async (id: string, data: {
  name?: string;
  email?: string;
  role?: string;
  organizationId?: string | null;
}) => {
  try {
    const response = await api.put(`/api/admin/users/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update user's subscription status
// Endpoint: PUT /api/admin/users/:id/subscription
// Request: { status: string }
// Response: { success: boolean, data: { subscriptionStatus: string, subscriptionId: string, subscription: Object } }
export const updateUserSubscriptionStatus = async (userId: string, status: string) => {
  try {
    const response = await api.put(`/api/admin/users/${userId}/subscription`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating user subscription status:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get user's subscription details
// Endpoint: GET /api/admin/users/:id/subscription
// Request: {}
// Response: { success: boolean, data: { subscriptionStatus: string, subscriptionId: string, subscription: Object, paymentVerified: boolean, customerId: string, invoices: Array } }
export const getUserSubscriptionDetails = async (userId: string) => {
  try {
    const response = await api.get(`/api/admin/users/${userId}/subscription`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user subscription details:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};