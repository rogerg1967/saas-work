import api from './api';

// Description: Get all threads for a chatbot
// Endpoint: GET /api/threads/chatbot/:chatbotId/threads
// Request: {}
// Response: { success: boolean, threads: Array<{ id: string, name: string, isActive: boolean, createdAt: string, updatedAt: string, lastMessageAt: string }> }
export const getChatbotThreads = async (chatbotId: string) => {
  try {
    const response = await api.get(`/api/threads/chatbot/${chatbotId}/threads`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chatbot threads:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Create a new thread
// Endpoint: POST /api/threads/chatbot/:chatbotId/threads
// Request: { name: string }
// Response: { success: boolean, thread: { id: string, name: string, isActive: boolean, createdAt: string, updatedAt: string, lastMessageAt: string } }
export const createThread = async (chatbotId: string, name: string) => {
  try {
    const response = await api.post(`/api/threads/chatbot/${chatbotId}/threads`, { name });
    return response.data;
  } catch (error) {
    console.error('Error creating thread:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get a specific thread
// Endpoint: GET /api/threads/threads/:threadId
// Request: {}
// Response: { success: boolean, thread: { id: string, name: string, chatbotId: string, isActive: boolean, createdAt: string, updatedAt: string, lastMessageAt: string } }
export const getThread = async (threadId: string) => {
  try {
    const response = await api.get(`/api/threads/threads/${threadId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching thread:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update a thread
// Endpoint: PUT /api/threads/threads/:threadId
// Request: { name?: string, isActive?: boolean }
// Response: { success: boolean, thread: { id: string, name: string, isActive: boolean, createdAt: string, updatedAt: string, lastMessageAt: string } }
export const updateThread = async (threadId: string, data: { name?: string; isActive?: boolean }) => {
  try {
    const response = await api.put(`/api/threads/threads/${threadId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating thread:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete a thread
// Endpoint: DELETE /api/threads/threads/:threadId
// Request: {}
// Response: { success: boolean, message: string }
export const deleteThread = async (threadId: string) => {
  try {
    const response = await api.delete(`/api/threads/threads/${threadId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting thread:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get messages for a thread
// Endpoint: GET /api/threads/threads/:threadId/messages
// Request: {}
// Response: { success: boolean, messages: Array<{ id: string, role: string, content: string, timestamp: string, image?: string }> }
export const getThreadMessages = async (threadId: string) => {
  try {
    const response = await api.get(`/api/threads/threads/${threadId}/messages`);
    return response.data;
  } catch (error) {
    console.error('Error fetching thread messages:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};