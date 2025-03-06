import api from './api';

// Description: Send message to chatbot
// Endpoint: POST /api/chatbot/:id/messages
// Request: { message: string, image?: File, model: string }
// Response: { response: string }
export const sendMessage = (chatbotId: string, message: string, image?: File, model?: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        response: `I am an AI assistant using ${model || 'default'} model. Here is my response to your ${image ? 'image and ' : ''}message: ${message}`
      });
    }, 500);
  });
};

// Description: Get chat history
// Endpoint: GET /api/chatbot/:id/messages
// Request: {}
// Response: { messages: Array<{ id: string, role: 'user' | 'assistant', content: string, timestamp: string, image?: string }> }
export const getChatHistory = (chatbotId: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        messages: [
          {
            id: '1',
            role: 'user',
            content: 'Hello, how can you help me?',
            timestamp: '2024-01-20T10:00:00Z'
          },
          {
            id: '2',
            role: 'assistant',
            content: 'Hi! I\'m here to assist you with any questions you have about our services.',
            timestamp: '2024-01-20T10:00:01Z'
          },
          {
            id: '3',
            role: 'user',
            content: 'What features do you offer?',
            timestamp: '2024-01-20T10:00:02Z',
            image: 'https://picsum.photos/300/200'
          },
          {
            id: '4',
            role: 'assistant',
            content: 'I see the image you shared. We offer various features including automated customer support, data analysis, and task automation. How can I help you today?',
            timestamp: '2024-01-20T10:00:03Z'
          }
        ]
      });
    }, 500);
  });
};

// Description: Get available LLM models
// Endpoint: GET /api/llm/models
// Request: {}
// Response: { models: Array<{ id: string, name: string, provider: string, capabilities: string[] }> }
export const getAvailableModels = async () => {
  try {
    const response = await api.get('/api/llm/models');
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};