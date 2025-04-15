const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ConversationThreadService = require('../services/conversationThreadService');
const MessageService = require('../services/messageService');
const Message = require('../models/Message');
const { requireUser } = require('./middleware/auth');
const { requireSubscription } = require('./middleware/subscriptionCheck');

// Get all threads for a chatbot
router.get('/chatbot/:chatbotId/threads', requireUser, requireSubscription, async (req, res) => {
  try {
    const { chatbotId } = req.params;
    const userId = req.user._id;

    console.log(`Fetching threads for chatbot: ${chatbotId} and user: ${userId}`);
    const threads = await ConversationThreadService.getByChatbotAndUser(chatbotId, userId);

    res.json({
      success: true,
      threads: threads.map(thread => ({
        id: thread._id,
        name: thread.name,
        isActive: thread.isActive,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        lastMessageAt: thread.lastMessageAt
      }))
    });
  } catch (error) {
    console.error(`Error fetching threads: ${error.message}`, error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch threads: ${error.message}`
    });
  }
});

// Create a new thread
router.post('/chatbot/:chatbotId/threads', requireUser, requireSubscription, async (req, res) => {
  try {
    const { chatbotId } = req.params;
    const { name } = req.body;
    const userId = req.user._id;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Thread name is required'
      });
    }

    console.log(`Creating new thread for chatbot: ${chatbotId}, user: ${userId}, name: ${name}`);

    const thread = await ConversationThreadService.create({
      chatbotId,
      userId,
      name,
      isActive: true
    });

    res.status(201).json({
      success: true,
      thread: {
        id: thread._id,
        name: thread.name,
        isActive: thread.isActive,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        lastMessageAt: thread.lastMessageAt
      }
    });
  } catch (error) {
    console.error(`Error creating thread: ${error.message}`, error);
    res.status(500).json({
      success: false,
      error: `Failed to create thread: ${error.message}`
    });
  }
});

// Get a specific thread
router.get('/threads/:threadId', requireUser, requireSubscription, async (req, res) => {
  try {
    const { threadId } = req.params;

    console.log(`Fetching thread with ID: ${threadId}`);
    const thread = await ConversationThreadService.getById(threadId);

    if (!thread) {
      return res.status(404).json({
        success: false,
        error: 'Thread not found'
      });
    }

    // Check if user has access to this thread
    if (thread.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to access this thread'
      });
    }

    res.json({
      success: true,
      thread: {
        id: thread._id,
        name: thread.name,
        chatbotId: thread.chatbotId,
        isActive: thread.isActive,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        lastMessageAt: thread.lastMessageAt
      }
    });
  } catch (error) {
    console.error(`Error fetching thread: ${error.message}`, error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch thread: ${error.message}`
    });
  }
});

// Update a thread
router.put('/threads/:threadId', requireUser, requireSubscription, async (req, res) => {
  try {
    const { threadId } = req.params;
    const { name, isActive } = req.body;

    console.log(`Updating thread with ID: ${threadId}`);
    const thread = await ConversationThreadService.getById(threadId);

    if (!thread) {
      return res.status(404).json({
        success: false,
        error: 'Thread not found'
      });
    }

    // Check if user has access to this thread
    if (thread.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to update this thread'
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedThread = await ConversationThreadService.update(threadId, updateData);

    res.json({
      success: true,
      thread: {
        id: updatedThread._id,
        name: updatedThread.name,
        isActive: updatedThread.isActive,
        createdAt: updatedThread.createdAt,
        updatedAt: updatedThread.updatedAt,
        lastMessageAt: updatedThread.lastMessageAt
      }
    });
  } catch (error) {
    console.error(`Error updating thread: ${error.message}`, error);
    res.status(500).json({
      success: false,
      error: `Failed to update thread: ${error.message}`
    });
  }
});

// Delete a thread
router.delete('/threads/:threadId', requireUser, requireSubscription, async (req, res) => {
  try {
    const { threadId } = req.params;

    console.log(`Deleting thread with ID: ${threadId}`);
    const thread = await ConversationThreadService.getById(threadId);

    if (!thread) {
      return res.status(404).json({
        success: false,
        error: 'Thread not found'
      });
    }

    // Check if user has access to this thread
    if (thread.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this thread'
      });
    }

    await ConversationThreadService.delete(threadId);

    res.json({
      success: true,
      message: 'Thread deleted successfully'
    });
  } catch (error) {
    console.error(`Error deleting thread: ${error.message}`, error);
    res.status(500).json({
      success: false,
      error: `Failed to delete thread: ${error.message}`
    });
  }
});

// Get messages for a thread
router.get('/threads/:threadId/messages', requireUser, requireSubscription, async (req, res) => {
  try {
    const { threadId } = req.params;

    console.log(`Fetching messages for thread: ${threadId}`);
    const thread = await ConversationThreadService.getById(threadId);

    if (!thread) {
      return res.status(404).json({
        success: false,
        error: 'Thread not found'
      });
    }

    // Check if user has access to this thread
    if (thread.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to access this thread'
      });
    }

    // Get messages for this thread
    const messages = await Message.find({ threadId }).sort({ timestamp: 1 });

    // Transform to expected format
    const formattedMessages = messages.map(msg => ({
      id: msg._id.toString(),
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
      image: msg.image // Make sure the image field is included in the response
    }));

    console.log(`Found ${messages.length} messages for thread ${threadId}`);

    res.json({
      success: true,
      messages: formattedMessages
    });
  } catch (error) {
    console.error(`Error fetching messages: ${error.message}`, error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch messages: ${error.message}`
    });
  }
});

module.exports = router;