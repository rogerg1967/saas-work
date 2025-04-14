import api from './api';

// Description: Get threads for a chatbot
// Endpoint: GET /api/threads/chatbot/:chatbotId
// Request: {}
// Response: { success: boolean, threads: Array<{ _id: string, name: string, chatbotId: string, userId: string, lastMessage: string, lastMessageAt: string, createdAt: string, updatedAt: string }> }
export const getThreadsByChatbot = async (chatbotId: string) => {
  try {
    const response = await api.get(`/api/threads/chatbot/${chatbotId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching threads:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get a thread by ID
// Endpoint: GET /api/threads/:id
// Request: {}
// Response: { success: boolean, thread: { _id: string, name: string, chatbotId: string, userId: string, lastMessage: string, lastMessageAt: string, createdAt: string, updatedAt: string } }
export const getThreadById = async (threadId: string) => {
  try {
    const response = await api.get(`/api/threads/${threadId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching thread:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Create a new thread
// Endpoint: POST /api/threads
// Request: { chatbotId: string, name: string }
// Response: { success: boolean, thread: { _id: string, name: string, chatbotId: string, userId: string, lastMessage: string, lastMessageAt: string, createdAt: string, updatedAt: string } }
export const createThread = async (data: { chatbotId: string, name: string }) => {
  try {
    const response = await api.post('/api/threads', data);
    return response.data;
  } catch (error) {
    console.error('Error creating thread:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update a thread
// Endpoint: PUT /api/threads/:id
// Request: { name: string }
// Response: { success: boolean, thread: { _id: string, name: string, chatbotId: string, userId: string, lastMessage: string, lastMessageAt: string, createdAt: string, updatedAt: string } }
export const updateThread = async (threadId: string, data: { name: string }) => {
  try {
    const response = await api.put(`/api/threads/${threadId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating thread:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete a thread
// Endpoint: DELETE /api/threads/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteThread = async (threadId: string) => {
  try {
    const response = await api.delete(`/api/threads/${threadId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting thread:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get messages for a thread
// Endpoint: GET /api/threads/:id/messages
// Request: {}
// Response: { success: boolean, messages: Array<{ id: string, role: string, content: string, timestamp: string, image?: string }> }
export const getThreadMessages = async (threadId: string) => {
  try {
    const response = await api.get(`/api/threads/${threadId}/messages`);
    return response.data;
  } catch (error) {
    console.error('Error fetching thread messages:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};