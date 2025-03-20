import api from './api';

// Description: Get list of available industries
// Endpoint: GET /api/industries
// Request: {}
// Response: { industries: string[] }
export const getIndustries = async () => {
  try {
    const response = await api.get('/api/industries');
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};