import api from './api';

// Description: Create organization
// Endpoint: POST /api/organizations
// Request: { name: string, industry: string }
// Response: { success: boolean, organization: { _id: string, name: string, industry: string, status: string } }
export const createOrganization = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        organization: {
          _id: '1',
          name: 'Acme Corp',
          industry: 'Technology',
          status: 'active'
        }
      });
    }, 500);
  });
};

// Description: Get organizations
// Endpoint: GET /api/organizations
// Request: {}
// Response: { organizations: Array<{ _id: string, name: string, industry: string, status: string }> }
export const getOrganizations = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        organizations: [
          { _id: '1', name: 'Acme Corp', industry: 'Technology', status: 'active' },
          { _id: '2', name: 'Globex Corp', industry: 'Healthcare', status: 'pending' },
          { _id: '3', name: 'Initech', industry: 'Finance', status: 'active' }
        ]
      });
    }, 500);
  });
};

// Description: Update organization
// Endpoint: PUT /api/organizations/:id
// Request: { name: string, industry: string }
// Response: { success: boolean, organization: { _id: string, name: string, industry: string, status: string } }
export const updateOrganization = (id: string, data: { name: string; industry: string }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        organization: {
          _id: id,
          name: data.name,
          industry: data.industry,
          status: 'active'
        }
      });
    }, 500);
  });
};

// Description: Delete organization
// Endpoint: DELETE /api/organizations/:id
// Request: {}
// Response: { success: boolean }
export const deleteOrganization = (id: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true
      });
    }, 500);
  });
};