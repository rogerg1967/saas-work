import api from './api';

// Description: Get chatbots
// Endpoint: GET /api/chatbots
// Request: {}
// Response: { chatbots: Array<{ _id: string, name: string, description: string, status: string }> }
export const getChatbots = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        chatbots: [
          { _id: '1', name: 'Sales Bot', description: 'AI assistant for sales inquiries', status: 'active' },
          { _id: '2', name: 'Support Bot', description: 'Customer support assistant', status: 'inactive' },
          { _id: '3', name: 'HR Bot', description: 'HR process automation', status: 'active' }
        ]
      });
    }, 500);
  });
};

// Description: Create chatbot
// Endpoint: POST /api/chatbots
// Request: { name: string, description: string }
// Response: { success: boolean, chatbot: { _id: string, name: string, description: string, status: string } }
export const createChatbot = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        chatbot: {
          _id: '4',
          name: 'New Bot',
          description: 'AI assistant',
          status: 'active'
        }
      });
    }, 500);
  });
};