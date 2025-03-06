import api from './api';

// Description: Get available chatbots
// Endpoint: GET /api/chatbots
// Request: {}
// Response: { chatbots: Array<{ _id: string, name: string, model: string, provider: string, description: string }> }
export const getChatbots = async () => {
  try {
    const response = await api.get('/api/chatbots');
    console.log('Successfully fetched chatbots');
    return response.data;
  } catch (error) {
    console.error('Error fetching chatbots:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Create new chatbot
// Endpoint: POST /api/chatbots
// Request: { name: string, model: string, provider: string, description: string }
// Response: { success: boolean, chatbot: { _id: string, name: string, model: string, provider: string, description: string } }
export const createChatbot = async (data: { name: string; model: string; provider: string; description: string }) => {
  try {
    const response = await api.post('/api/chatbots', data);
    console.log('Successfully created chatbot');
    return response.data;
  } catch (error) {
    console.error('Error creating chatbot:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get chat conversation
// Endpoint: GET /api/chatbots/:id/conversation
// Request: {}
// Response: { messages: Array<{ id: string, role: string, content: string, timestamp: string, image?: string }> }
export const getChatConversation = async (chatbotId: string) => {
  try {
    const response = await api.get(`/api/chatbots/${chatbotId}/conversation`);
    console.log('Successfully fetched chat conversation');
    return response.data;
  } catch (error) {
    console.error('Error fetching chat conversation:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Send message to chatbot
// Endpoint: POST /api/chatbots/:id/message
// Request: { message: string, image?: File }
// Response: { id: string, role: string, content: string, timestamp: string }
export const sendChatMessage = async (chatbotId: string, message: string, image?: File) => {
  try {
    const formData = new FormData();
    formData.append('message', message);

    if (image) {
      formData.append('image', image);
    }

    const response = await api.post(`/api/chatbots/${chatbotId}/message`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Successfully sent chat message');
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};