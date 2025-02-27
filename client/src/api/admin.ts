import api from './api';

// Description: Get all organizations for admin
// Endpoint: GET /api/admin/organizations
// Request: {}
// Response: { organizations: Array<{ _id: string, name: string, status: string, industry: string, users: Array<{ _id: string, name: string, email: string, role: string }> }> }
export const getAdminOrganizations = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        organizations: [
          {
            _id: '1',
            name: 'Acme Corp',
            status: 'active',
            industry: 'Technology',
            users: [
              { _id: 'u1', name: 'John Doe', email: 'john@acme.com', role: 'Admin' },
              { _id: 'u2', name: 'Jane Smith', email: 'jane@acme.com', role: 'Manager' }
            ]
          },
          {
            _id: '2',
            name: 'Globex Corp',
            status: 'pending',
            industry: 'Healthcare',
            users: [
              { _id: 'u3', name: 'Bob Wilson', email: 'bob@globex.com', role: 'Admin' }
            ]
          }
        ]
      });
    }, 500);
  });
};

// Description: Update organization status
// Endpoint: PUT /api/admin/organizations/:id/status
// Request: { status: string }
// Response: { success: boolean }
export const updateOrganizationStatus = (id: string, status: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
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