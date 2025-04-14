const express = require('express');
const router = express.Router();
const ThreadService = require('../services/threadService');
const MessageService = require('../services/messageService');
const ChatbotService = require('../services/chatbotService');
const { requireUser } = require('./middleware/auth');
const { requireSubscription } = require('./middleware/subscriptionCheck');

// Get all threads for a chatbot
router.get('/chatbot/:chatbotId', requireUser, requireSubscription, async (req, res) => {
  try {
    const { chatbotId } = req.params;
    const userId = req.user._id;

    console.log(`Fetching threads for chatbot: ${chatbotId} and user: ${userId}`);

    // Check if chatbot exists and user has access
    const chatbot = await ChatbotService.getById(chatbotId);
    if (!chatbot) {
      console.log(`Chatbot with ID ${chatbotId} not found`);
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    const hasAccess = await ChatbotService.userHasAccess(userId, chatbot);
    if (!hasAccess) {
      console.warn(`User ${userId} attempted to access threads for chatbot ${chatbotId} without permission`);
      return res.status(403).json({ error: 'You do not have permission to access this chatbot' });
    }

    const threads = await ThreadService.getByChatbot(chatbotId, userId);
    console.log(`Found ${threads.length} threads for chatbot ${chatbotId}`);

    res.json({ success: true, threads });
  } catch (error) {
    console.error(`Error fetching threads: ${error.message}`, error);
    res.status(500).json({ error: `Failed to fetch threads: ${error.message}` });
  }
});

// Get a specific thread
router.get('/:id', requireUser, requireSubscription, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching thread with ID: ${id}`);

    const thread = await ThreadService.getById(id);
    if (!thread) {
      console.log(`Thread with ID ${id} not found`);
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Check if user has access to this thread
    const hasAccess = await ThreadService.userHasAccess(req.user._id, thread);
    if (!hasAccess) {
      console.warn(`User ${req.user._id} attempted to access thread ${id} without permission`);
      return res.status(403).json({ error: 'You do not have permission to access this thread' });
    }

    res.json({ success: true, thread });
  } catch (error) {
    console.error(`Error fetching thread: ${error.message}`, error);
    res.status(500).json({ error: `Failed to fetch thread: ${error.message}` });
  }
});

// Create a new thread
router.post('/', requireUser, requireSubscription, async (req, res) => {
  try {
    const { chatbotId, name } = req.body;
    const userId = req.user._id;

    console.log(`Creating new thread for chatbot: ${chatbotId}`);

    if (!chatbotId || !name) {
      console.log('Missing required fields for thread creation');
      return res.status(400).json({ error: 'Chatbot ID and name are required' });
    }

    // Check if chatbot exists and user has access
    const chatbot = await ChatbotService.getById(chatbotId);
    if (!chatbot) {
      console.log(`Chatbot with ID ${chatbotId} not found`);
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    const hasAccess = await ChatbotService.userHasAccess(userId, chatbot);
    if (!hasAccess) {
      console.warn(`User ${userId} attempted to create thread for chatbot ${chatbotId} without permission`);
      return res.status(403).json({ error: 'You do not have permission to access this chatbot' });
    }

    const threadData = {
      name,
      chatbotId,
      userId,
    };

    const thread = await ThreadService.create(threadData);
    console.log(`Successfully created thread with ID: ${thread._id}`);

    res.status(201).json({
      success: true,
      thread
    });
  } catch (error) {
    console.error(`Error creating thread: ${error.message}`, error);
    res.status(500).json({ error: `Failed to create thread: ${error.message}` });
  }
});

// Update a thread
router.put('/:id', requireUser, requireSubscription, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    console.log(`Updating thread with ID: ${id}`);

    if (!name) {
      console.log('Missing required fields for thread update');
      return res.status(400).json({ error: 'Name is required' });
    }

    const thread = await ThreadService.getById(id);
    if (!thread) {
      console.log(`Thread with ID ${id} not found`);
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Check if user has access to this thread
    const hasAccess = await ThreadService.userHasAccess(req.user._id, thread);
    if (!hasAccess) {
      console.warn(`User ${req.user._id} attempted to update thread ${id} without permission`);
      return res.status(403).json({ error: 'You do not have permission to update this thread' });
    }

    const updatedThread = await ThreadService.update(id, { name });
    console.log(`Successfully updated thread: ${updatedThread.name}`);

    res.json({
      success: true,
      thread: updatedThread
    });
  } catch (error) {
    console.error(`Error updating thread: ${error.message}`, error);
    res.status(500).json({ error: `Failed to update thread: ${error.message}` });
  }
});

// Delete a thread
router.delete('/:id', requireUser, requireSubscription, async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Deleting thread with ID: ${id}`);

    const thread = await ThreadService.getById(id);
    if (!thread) {
      console.log(`Thread with ID ${id} not found`);
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Check if user has access to this thread
    const hasAccess = await ThreadService.userHasAccess(req.user._id, thread);
    if (!hasAccess) {
      console.warn(`User ${req.user._id} attempted to delete thread ${id} without permission`);
      return res.status(403).json({ error: 'You do not have permission to delete this thread' });
    }

    await ThreadService.delete(id);
    console.log(`Successfully deleted thread with ID: ${id}`);

    res.json({
      success: true,
      message: 'Thread deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting thread: ${error.message}`, error);
    res.status(500).json({ error: `Failed to delete thread: ${error.message}` });
  }
});

// Get messages for a thread
router.get('/:id/messages', requireUser, requireSubscription, async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`Fetching messages for thread: ${id}`);

    const thread = await ThreadService.getById(id);
    if (!thread) {
      console.log(`Thread with ID ${id} not found`);
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Check if user has access to this thread
    const hasAccess = await ThreadService.userHasAccess(req.user._id, thread);
    if (!hasAccess) {
      console.warn(`User ${req.user._id} attempted to access messages for thread ${id} without permission`);
      return res.status(403).json({ error: 'You do not have permission to access this thread' });
    }

    const messages = await MessageService.getByThread(id);

    // Transform to expected format
    const formattedMessages = messages.map(msg => ({
      id: msg._id.toString(),
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
      image: msg.image
    }));

    console.log(`Successfully retrieved ${formattedMessages.length} messages for thread: ${thread.name}`);

    res.json({
      success: true,
      messages: formattedMessages
    });
  } catch (error) {
    console.error(`Error fetching messages: ${error.message}`, error);
    res.status(500).json({ error: `Failed to fetch messages: ${error.message}` });
  }
});

module.exports = router;