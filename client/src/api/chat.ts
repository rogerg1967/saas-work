import api from './api';

// Description: Get available chatbots
// Endpoint: GET /api/chatbots
// Request: {}
// Response: { chatbots: Array<{ _id: string, name: string, model: string, provider: string, description: string }> }
export const getChatbots = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        chatbots: [
          {
            _id: '1',
            name: 'Customer Support Bot',
            model: 'gpt-4',
            provider: 'OpenAI',
            description: 'AI assistant for handling customer inquiries'
          },
          {
            _id: '2',
            name: 'Sales Assistant',
            model: 'claude-3-opus',
            provider: 'Anthropic',
            description: 'Specialized bot for sales and product information'
          },
          {
            _id: '3',
            name: 'HR Helper',
            model: 'gpt-4-vision',
            provider: 'OpenAI',
            description: 'HR process automation and employee support'
          }
        ]
      });
    }, 500);
  });
};

// Description: Create new chatbot
// Endpoint: POST /api/chatbots
// Request: { name: string, model: string, provider: string, description: string }
// Response: { success: boolean, chatbot: { _id: string, name: string, model: string, provider: string, description: string } }
export const createChatbot = (data: { name: string; model: string; provider: string; description: string }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        chatbot: {
          _id: Math.random().toString(36).substr(2, 9),
          ...data
        }
      });
    }, 500);
  });
};

// Description: Get chat conversation
// Endpoint: GET /api/chatbots/:id/conversation
// Request: {}
// Response: { messages: Array<{ id: string, role: string, content: string, timestamp: string, image?: string }> }
export const getChatConversation = (chatbotId: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        messages: [
          {
            id: '1',
            role: 'user',
            content: 'Hi, can you help me with product information?',
            timestamp: '2024-01-20T10:00:00Z'
          },
          {
            id: '2',
            role: 'assistant',
            content: 'Of course! I\'d be happy to help you with product information. What would you like to know?',
            timestamp: '2024-01-20T10:00:05Z'
          },
          {
            id: '3',
            role: 'user',
            content: 'Here is our latest product image',
            timestamp: '2024-01-20T10:00:10Z',
            image: 'https://picsum.photos/400/300'
          },
          {
            id: '4',
            role: 'assistant',
            content: 'I can see the product image. It appears to be a high-quality item. Would you like me to describe its features?',
            timestamp: '2024-01-20T10:00:15Z'
          }
        ]
      });
    }, 500);
  });
};

// Description: Send message to chatbot
// Endpoint: POST /api/chatbots/:id/message
// Request: { message: string, image?: File }
// Response: { id: string, role: string, content: string, timestamp: string }
export const sendChatMessage = (chatbotId: string, message: string, image?: File) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: `I've analyzed ${image ? 'the image and ' : ''}your message: "${message}". Here's my response...`,
        timestamp: new Date().toISOString()
      });
    }, 1000);
  });
};