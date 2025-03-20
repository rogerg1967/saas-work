import api from './api';

// Description: Send message to chatbot
// Endpoint: POST /api/chatbots/:id/message
// Request: { message: string, image?: File }
// Response: { id: string, role: 'user' | 'assistant', content: string, timestamp: string }
export const sendMessage = async (chatbotId: string, message: string, image?: File, model?: string) => {
  try {
    const formData = new FormData();

    if (message) {
      formData.append('message', message);
    }

    if (image) {
      formData.append('image', image);
    }

    // Note: The model parameter is ignored because the chatbot already has a model configured

    const response = await api.post(`/api/chatbots/${chatbotId}/message`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get chat history
// Endpoint: GET /api/chatbots/:id/conversation
// Request: {}
// Response: { messages: Array<{ id: string, role: 'user' | 'assistant', content: string, timestamp: string, image?: string }> }
export const getChatHistory = async (chatbotId: string) => {
  try {
    const response = await api.get(`/api/chatbots/${chatbotId}/conversation`);
    return response.data;
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get available AI models for chat
// Endpoint: GET /api/messages/models
// Request: { provider?: string }
// Response: { success: boolean, models: Array<{ id: string, name: string, provider: string, capabilities: string[] }> }
export const getAvailableModels = async (provider?: string) => {
  try {
    const params = provider ? { provider } : {};
    const response = await api.get('/api/messages/models', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching available models:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};