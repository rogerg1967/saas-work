import api from './api';

// Description: Get team members
// Endpoint: GET /api/team
// Request: {}
// Response: { members: Array<{ _id: string, name: string, role: string, email: string, phone: string, image: string }> }
export const getTeamMembers = async () => {
  try {
    const response = await api.get('/api/team');
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Create team member
// Endpoint: POST /api/team
// Request: { name: string, role: string, email: string, phone: string }
// Response: { success: boolean, member: { _id: string, name: string, role: string, email: string, phone: string, image: string } }
export const createTeamMember = async (data: { name: string; role: string; email: string; phone: string }) => {
  try {
    const response = await api.post('/api/team', data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update team member
// Endpoint: PUT /api/team/:id
// Request: { name: string, role: string, email: string, phone: string }
// Response: { success: boolean, member: { _id: string, name: string, role: string, email: string, phone: string, image: string } }
export const updateTeamMember = async (id: string, data: { name: string; role: string; email: string; phone: string }) => {
  try {
    const response = await api.put(`/api/team/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete team member
// Endpoint: DELETE /api/team/:id
// Request: {}
// Response: { success: boolean }
export const deleteTeamMember = async (id: string) => {
  try {
    const response = await api.delete(`/api/team/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};