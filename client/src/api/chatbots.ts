import api from './api';

interface Chatbot {
  _id: string;
  name: string;
  description: string;
  status?: string;
  model: string;
  provider: string;
}

// Description: Get chatbots
// Endpoint: GET /api/chatbots
// Request: {}
// Response: { chatbots: Array<{ _id: string, name: string, description: string, status: string, model: string, provider: string }> }
export const getChatbots = async () => {
  try {
    const response = await api.get('/api/chatbots');
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Create chatbot
// Endpoint: POST /api/chatbots
// Request: { name: string, description: string, model: string, provider: string }
// Response: { success: boolean, chatbot: { _id: string, name: string, description: string, status: string, model: string, provider: string } }
export const createChatbot = async (data: {
  name: string;
  description: string;
  model: string;
  provider: string;
}) => {
  try {
    const response = await api.post('/api/chatbots', data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};