import api from './api';

// Description: Get LLM settings
// Endpoint: GET /api/llm/settings
// Request: {}
// Response: { settings: { provider: string, model: string, temperature: number, maxTokens: number } }
export const getLLMSettings = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        settings: {
          provider: 'openai',
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2048
        }
      });
    }, 500);
  });
};

// Description: Update LLM settings
// Endpoint: PUT /api/llm/settings
// Request: { provider: string, model: string, temperature: number, maxTokens: number }
// Response: { success: boolean, settings: { provider: string, model: string, temperature: number, maxTokens: number } }
export const updateLLMSettings = (data: { provider: string; model: string; temperature: number; maxTokens: number }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        settings: data
      });
    }, 500);
  });
};