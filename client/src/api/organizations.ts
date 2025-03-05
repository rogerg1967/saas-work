import api from './api';

// Description: Create organization
// Endpoint: POST /api/organizations
// Request: { name: string, industry: string }
// Response: { success: boolean, organization: { _id: string, name: string, industry: string, status: string } }
export const createOrganization = async (data: { name: string; industry: string }) => {
  try {
    const response = await api.post('/api/organizations', data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get organizations
// Endpoint: GET /api/organizations
// Request: {}
// Response: { organizations: Array<{ _id: string, name: string, industry: string, status: string }> }
export const getOrganizations = async () => {
  try {
    const response = await api.get('/api/organizations');
    return {
      organizations: response.data.data.organizations
    };
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update organization
// Endpoint: PUT /api/organizations/:id
// Request: { name: string, industry: string }
// Response: { success: boolean, organization: { _id: string, name: string, industry: string, status: string } }
export const updateOrganization = async (id: string, data: { name: string; industry: string }) => {
  try {
    const response = await api.put(`/api/organizations/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete organization
// Endpoint: DELETE /api/organizations/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteOrganization = async (id: string) => {
  try {
    const response = await api.delete(`/api/organizations/${id}`);
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};