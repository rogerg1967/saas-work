import api from './api';

// Description: Send a message to a chatbot
// Endpoint: POST /api/chatbots/:id/message
// Request: { message: string, file?: File, model?: string, threadId: string }
// Response: { id: string, role: string, content: string, timestamp: string }
export const sendMessage = async (
  chatbotId: string,
  message: string,
  file: File | null,
  model?: string,
  threadId?: string
) => {
  try {
    const formData = new FormData();
    formData.append('message', message);

    if (model) {
      formData.append('model', model);
    }

    if (threadId) {
      formData.append('threadId', threadId);
    }

    if (file) {
      // Append the file to the correct field based on its type
      if (file.type.startsWith('image/')) {
        formData.append('image', file);
      } else {
        formData.append('document', file);
      }
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
// Response: { messages: Array<{ id: string, role: string, content: string, timestamp: string, image?: string, document?: string }> }
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