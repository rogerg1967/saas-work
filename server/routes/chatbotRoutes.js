const express = require('express');
const router = express.Router();
const ChatbotService = require('../services/chatbotService');
const MessageService = require('../services/messageService');
const { requireUser } = require('./middleware/auth');
const { requireSubscription } = require('./middleware/subscriptionCheck');
const { uploadSingleImage } = require('./middleware/upload');
const { sendLLMRequest } = require('../services/llmService');

// Get all chatbots for the user's organization or all chatbots for admin
router.get('/', requireUser, requireSubscription, async (req, res) => {
  try {
    const { user } = req;
    let chatbots = [];

    // If user is admin, fetch all chatbots
    if (user.role === 'admin') {
      console.log('Admin user - fetching all chatbots');
      const Chatbot = require('../models/Chatbot');
      chatbots = await Chatbot.find({});
      console.log(`Found ${chatbots.length} chatbots for admin user`);
    } else {
      // For regular users, fetch only their organization's chatbots
      console.log(`Fetching chatbots for organization: ${user.organizationId}`);
      chatbots = await ChatbotService.getByOrganization(user.organizationId);
      console.log(`Found ${chatbots.length} chatbots for organization ${user.organizationId}`);
    }

    console.log(`Successfully retrieved ${chatbots.length} chatbots`);
    res.json({ chatbots });
  } catch (error) {
    console.error(`Error fetching chatbots: ${error.message}`, error);
    res.status(500).json({ error: `Failed to fetch chatbots: ${error.message}` });
  }
});

// Get a specific chatbot by ID
router.get('/:id', requireUser, requireSubscription, async (req, res) => {
  try {
    console.log(`Fetching chatbot with ID: ${req.params.id}`);
    const chatbot = await ChatbotService.getById(req.params.id);
    if (!chatbot) {
      console.log(`Chatbot with ID ${req.params.id} not found`);
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    // Verify the chatbot belongs to the user's organization
    if (chatbot.organizationId.toString() !== req.user.organizationId.toString()) {
      console.warn(`User from organization ${req.user.organizationId} attempted to access chatbot from organization ${chatbot.organizationId}`);
      return res.status(403).json({ error: 'You do not have permission to access this chatbot' });
    }

    console.log(`Successfully retrieved chatbot: ${chatbot.name}`);
    res.json({ chatbot });
  } catch (error) {
    console.error(`Error fetching chatbot: ${error.message}`, error);
    res.status(500).json({ error: `Failed to fetch chatbot: ${error.message}` });
  }
});

// Create a new chatbot
router.post('/', requireUser, requireSubscription, async (req, res) => {
  try {
    console.log('Creating new chatbot');
    const { name, model, provider, description } = req.body;

    if (!name || !model || !provider) {
      console.log('Missing required fields for chatbot creation');
      return res.status(400).json({ error: 'Name, model, and provider are required' });
    }

    // Special handling for admin users who might not have an organizationId
    if (req.user.role === 'admin' && !req.user.organizationId) {
      console.log('Admin user without organization is trying to create a chatbot');

      // Check if the admin has specified an organizationId in the request
      const targetOrgId = req.body.organizationId;

      if (!targetOrgId) {
        return res.status(400).json({
          error: 'As an admin without assigned organization, you must specify an organizationId in your request'
        });
      }

      // Validate that the organization exists
      const Organization = require('../models/Organization');
      const orgExists = await Organization.findById(targetOrgId);

      if (!orgExists) {
        return res.status(404).json({ error: 'The specified organization does not exist' });
      }

      console.log(`Admin creating chatbot "${name}" for organization ${targetOrgId}`);
      const chatbotData = {
        name,
        model,
        provider,
        description: description || '',
        organizationId: targetOrgId,
        createdBy: req.user._id
      };

      const chatbot = await ChatbotService.create(chatbotData);
      console.log(`Successfully created chatbot with ID: ${chatbot._id}`);
      return res.status(201).json({
        success: true,
        chatbot
      });
    }

    // Regular flow for non-admin users or admins with an organization
    if (!req.user.organizationId) {
      return res.status(400).json({
        error: 'Your account is not associated with any organization. Please contact an administrator.'
      });
    }

    const chatbotData = {
      name,
      model,
      provider,
      description: description || '',
      organizationId: req.user.organizationId,
      createdBy: req.user._id
    };

    console.log(`Creating chatbot "${name}" for organization ${req.user.organizationId}`);
    const chatbot = await ChatbotService.create(chatbotData);
    console.log(`Successfully created chatbot with ID: ${chatbot._id}`);
    res.status(201).json({
      success: true,
      chatbot
    });
  } catch (error) {
    console.error(`Error creating chatbot: ${error.message}`, error);
    res.status(500).json({ error: `Failed to create chatbot: ${error.message}` });
  }
});

// Delete a chatbot
router.delete('/:id', requireUser, requireSubscription, async (req, res) => {
  try {
    console.log(`Attempting to delete chatbot with ID: ${req.params.id}`);
    const chatbot = await ChatbotService.getById(req.params.id);

    if (!chatbot) {
      console.log(`Chatbot with ID ${req.params.id} not found for deletion`);
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    // Verify the chatbot belongs to the user's organization
    if (chatbot.organizationId.toString() !== req.user.organizationId.toString()) {
      console.warn(`User from organization ${req.user.organizationId} attempted to delete chatbot from organization ${chatbot.organizationId}`);
      return res.status(403).json({ error: 'You do not have permission to delete this chatbot' });
    }

    await ChatbotService.delete(req.params.id);
    console.log(`Successfully deleted chatbot with ID: ${req.params.id}`);
    res.json({ success: true, message: 'Chatbot deleted successfully' });
  } catch (error) {
    console.error(`Error deleting chatbot: ${error.message}`, error);
    res.status(500).json({ error: `Failed to delete chatbot: ${error.message}` });
  }
});

// Get chat conversation for a chatbot
router.get('/:id/conversation', requireUser, requireSubscription, async (req, res) => {
  try {
    console.log(`Fetching conversation for chatbot with ID: ${req.params.id}`);
    const chatbot = await ChatbotService.getById(req.params.id);

    if (!chatbot) {
      console.log(`Chatbot with ID ${req.params.id} not found`);
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    // Skip organization check for admin users
    if (req.user.role !== 'admin') {
      // Verify the chatbot belongs to the user's organization
      if (chatbot.organizationId.toString() !== req.user.organizationId.toString()) {
        console.warn(`User from organization ${req.user.organizationId} attempted to access chatbot from organization ${chatbot.organizationId}`);
        return res.status(403).json({ error: 'You do not have permission to access this chatbot' });
      }
    } else {
      console.log(`Admin user accessing chatbot from organization ${chatbot.organizationId}`);
    }

    // Fetch messages from database
    const messages = await MessageService.getByChatbot(req.params.id);

    // Transform to expected format
    const formattedMessages = messages.map(msg => ({
      id: msg._id.toString(),
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
      image: msg.image
    }));

    console.log(`Successfully retrieved ${formattedMessages.length} messages for chatbot: ${chatbot.name}`);
    res.json({ messages: formattedMessages });
  } catch (error) {
    console.error(`Error fetching conversation: ${error.message}`, error);
    res.status(500).json({ error: `Failed to fetch conversation: ${error.message}` });
  }
});

// Send a message to a chatbot
router.post('/:id/message', requireUser, requireSubscription, uploadSingleImage, async (req, res) => {
  try {
    console.log(`Sending message to chatbot with ID: ${req.params.id}`);
    const chatbot = await ChatbotService.getById(req.params.id);

    if (!chatbot) {
      console.log(`Chatbot with ID ${req.params.id} not found`);
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    // Skip organization check for admin users
    if (req.user.role !== 'admin') {
      // Verify the chatbot belongs to the user's organization
      if (chatbot.organizationId.toString() !== req.user.organizationId.toString()) {
        console.warn(`User from organization ${req.user.organizationId} attempted to access chatbot from organization ${chatbot.organizationId}`);
        return res.status(403).json({ error: 'You do not have permission to access this chatbot' });
      }
    } else {
      console.log(`Admin user sending message to chatbot from organization ${chatbot.organizationId}`);
    }

    const { message } = req.body;

    if (!message && !req.file) {
      return res.status(400).json({ error: 'Message or image is required' });
    }

    // Process image if provided
    let imagePath = null;
    if (req.file) {
      imagePath = await MessageService.saveImage(req.file);
    }

    // Process message with LLM and save to database
    const response = await MessageService.processMessage(
      chatbot,
      message || "Image message",
      req.user._id,
      imagePath
    );

    // Format response for client
    const responseObj = {
      id: response._id.toString(),
      role: response.role,
      content: response.content,
      timestamp: response.timestamp.toISOString()
    };

    console.log(`Successfully processed message for chatbot: ${chatbot.name}`);
    res.json(responseObj);
  } catch (error) {
    console.error(`Error processing message: ${error.message}`, error);
    res.status(500).json({ error: `Failed to process message: ${error.message}` });
  }
});

module.exports = router;