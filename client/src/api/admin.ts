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
// Response: { success: boolean }
export const deleteOrganization = (id: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
};

// Description: Get all users
// Endpoint: GET /api/admin/users
// Request: {}
// Response: { users: Array<{ _id: string, name: string, email: string, role: string, organization: { _id: string, name: string } }> }
export const getAdminUsers = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        users: [
          {
            _id: 'u1',
            name: 'John Doe',
            email: 'john@acme.com',
            role: 'Admin',
            organization: { _id: '1', name: 'Acme Corp' }
          },
          {
            _id: 'u2',
            name: 'Jane Smith',
            email: 'jane@acme.com',
            role: 'Manager',
            organization: { _id: '1', name: 'Acme Corp' }
          },
          {
            _id: 'u3',
            name: 'Bob Wilson',
            email: 'bob@globex.com',
            role: 'Admin',
            organization: { _id: '2', name: 'Globex Corp' }
          }
        ]
      });
    }, 500);
  });
};

// Description: Update user role
// Endpoint: PUT /api/admin/users/:id/role
// Request: { role: string }
// Response: { success: boolean }
export const updateUserRole = (id: string, role: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
};

// Description: Delete user
// Endpoint: DELETE /api/admin/users/:id
// Request: {}
// Response: { success: boolean }
export const deleteUser = (id: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
};