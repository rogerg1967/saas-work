import api from './api';

// Description: Get LLM settings
// Endpoint: GET /api/llm/settings
// Request: {}
// Response: { success: boolean, settings: { provider: string, model: string, temperature: number, maxTokens: number, openaiApiKey: string, anthropicApiKey: string } }
export const getLLMSettings = async () => {
  try {
    const response = await api.get('/api/llm/settings');
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update LLM settings
// Endpoint: PUT /api/llm/settings
// Request: { provider: string, model: string, temperature: number, maxTokens: number, openaiApiKey?: string, anthropicApiKey?: string }
// Response: { success: boolean, settings: { provider: string, model: string, temperature: number, maxTokens: number, openaiApiKey: string, anthropicApiKey: string } }
export const updateLLMSettings = async (data: {
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  openaiApiKey?: string;
  anthropicApiKey?: string;
}) => {
  try {
    const response = await api.put('/api/llm/settings', data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};