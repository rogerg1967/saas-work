import api from './api';

// Description: Send a message to a chatbot
// Endpoint: POST /api/chatbots/:id/message
// Request: { message: string, threadId?: string, image?: File }
// Response: { id: string, role: string, content: string, timestamp: string }
export const sendMessage = async (chatbotId: string, message: string, image?: File, model?: string, threadId?: string) => {
  try {
    const formData = new FormData();
    formData.append('message', message);

    if (model) {
      formData.append('model', model);
    }

    if (threadId) {
      formData.append('threadId', threadId);
    }

    if (image) {
      formData.append('image', image);
    }

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

// Description: Get chat history for a thread
// Endpoint: GET /api/threads/threads/:threadId/messages
// Request: {}
// Response: { messages: Array<{ id: string, role: string, content: string, timestamp: string, image?: string }> }
export const getChatHistory = async (chatbotId: string, threadId?: string) => {
  try {
    // If threadId is provided, fetch messages from that thread
    if (threadId) {
      const response = await api.get(`/api/threads/threads/${threadId}/messages`);
      return response.data;
    }

    // Otherwise use the legacy endpoint (for backward compatibility)
    const response = await api.get(`/api/chatbots/${chatbotId}/conversation`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get available AI models for chat
// Endpoint: GET /api/messages/models
// Request: { provider?: string, capabilities?: string[] }
// Response: { success: boolean, models: Array<{ id: string, name: string, provider: string, capabilities: string[] }> }
export const getAvailableModels = async (provider?: string, capabilities?: string[]) => {
  try {
    let params: any = {};

    if (provider) {
      params.provider = provider;
    }

    if (capabilities && capabilities.length) {
      params.capabilities = capabilities.join(',');
    }

    const response = await api.get('/api/llm/models', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching available models:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};