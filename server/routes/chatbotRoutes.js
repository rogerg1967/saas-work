const express = require('express');
const router = express.Router();
const ChatbotService = require('../services/chatbotService');
const MessageService = require('../services/messageService');
const AIModelService = require('../services/aiModelService');
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

/**
 * @route PUT /api/chatbots/:id
 * @desc Update a chatbot
 * @access Private
 */
router.put('/:id', requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, model, provider } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!name || !description || !model || !provider) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Update the chatbot
    const updatedChatbot = await ChatbotService.updateChatbot(id, {
      name,
      description,
      model,
      provider,
      userId
    });

    res.json({
      success: true,
      chatbot: updatedChatbot
    });
  } catch (error) {
    console.error('Error updating chatbot:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Failed to update chatbot'
    });
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

    // Skip organization check for admin users
    if (req.user.role === 'admin') {
      console.log(`Admin user deleting chatbot with ID: ${req.params.id}`);
    } else {
      // For non-admin users, verify the chatbot belongs to the user's organization
      if (chatbot.organizationId.toString() !== req.user.organizationId.toString()) {
        console.warn(`User from organization ${req.user.organizationId} attempted to delete chatbot from organization ${chatbot.organizationId}`);
        return res.status(403).json({ error: 'You do not have permission to delete this chatbot' });
      }
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

/**
 * @route POST /api/chatbots/:id/message
 * @desc Send a message to a chatbot
 * @access Private
 */
router.post('/:id/message', requireUser, requireSubscription, uploadSingleImage, async (req, res) => {
  try {
    console.log(`Processing message for chatbot ID: ${req.params.id}`);
    const userId = req.user._id;
    const { message } = req.body;
    const image = req.file;

    console.log(`Received message request for chatbot ${req.params.id} from user ${userId}`);
    console.log(`Message content: ${message || '(empty)'}`);
    console.log(`Image attached: ${image ? 'Yes' : 'No'}`);
    if (image) {
      console.log(`Image details: ${JSON.stringify({
        filename: image.originalname,
        mimetype: image.mimetype,
        size: image.size
      })}`);
    }

    // Validate input - require either message or image
    if (!message && !image) {
      console.error('No message or image provided');
      return res.status(400).json({
        success: false,
        error: 'Message or image is required'
      });
    }

    // Get chatbot
    const chatbot = await ChatbotService.getById(req.params.id);

    if (!chatbot) {
      console.error(`Chatbot not found with ID: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        error: 'Chatbot not found'
      });
    }

    // Check if user has access to this chatbot
    const hasAccess = await ChatbotService.userHasAccess(userId, chatbot);

    if (!hasAccess) {
      console.error(`User ${userId} does not have access to chatbot ${req.params.id}`);
      return res.status(403).json({
        success: false,
        error: 'You do not have access to this chatbot'
      });
    }

    let imagePath = null;

    // Save image if it exists
    if (image) {
      console.log('Processing image upload');
      imagePath = await MessageService.saveImage(image);
      console.log(`Image saved at ${imagePath}`);
    }

    // Process message
    console.log(`Sending to MessageService.processMessage with chatbot model: ${chatbot.model}, provider: ${chatbot.provider}`);
    const response = await MessageService.processMessage(
      chatbot,
      message || '',
      userId,
      imagePath
    );

    console.log(`Successfully processed message, response ID: ${response._id}`);
    res.json({
      success: true,
      id: response._id,
      role: response.role,
      content: response.content,
      timestamp: response.timestamp
    });
  } catch (error) {
    console.error(`Error processing message: ${error.message}`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process message'
    });
  }
});

// Update chatbot settings
router.put('/:id/settings', requireUser, requireSubscription, async (req, res) => {
  try {
    console.log(`Updating settings for chatbot with ID: ${req.params.id}`);
    const chatbot = await ChatbotService.getById(req.params.id);

    if (!chatbot) {
      console.log(`Chatbot with ID ${req.params.id} not found`);
      return res.status(404).json({ error: 'Chatbot not found' });
    }

    // Verify the chatbot belongs to the user's organization or user is admin
    if (req.user.role !== 'admin' && chatbot.organizationId.toString() !== req.user.organizationId.toString()) {
      console.warn(`User from organization ${req.user.organizationId} attempted to update chatbot from organization ${chatbot.organizationId}`);
      return res.status(403).json({ error: 'You do not have permission to update this chatbot' });
    }

    const { provider, model } = req.body;

    if (!provider || !model) {
      return res.status(400).json({ error: 'Provider and model are required' });
    }

    // Update the chatbot with new settings
    chatbot.provider = provider.toLowerCase();
    chatbot.model = model;
    await chatbot.save();

    console.log(`Successfully updated settings for chatbot: ${chatbot.name}`);
    res.json({
      success: true,
      chatbot
    });
  } catch (error) {
    console.error(`Error updating chatbot settings: ${error.message}`, error);
    res.status(500).json({ error: `Failed to update chatbot settings: ${error.message}` });
  }
});

/**
 * @route GET /api/messages/models
 * @desc Get available models for chat
 * @access Private
 */
router.get('/models', requireUser, (req, res) => {
  try {
    console.log('Fetching available chat models');

    // Get provider from query parameter or return all models
    const { provider } = req.query;
    let models;

    if (provider) {
      models = AIModelService.getModelsByProvider(provider);
      console.log(`Fetched ${models.length} chat models for provider: ${provider}`);
    } else {
      models = AIModelService.getAvailableModels();
      console.log(`Fetched ${models.length} chat models from all providers`);
    }

    // Filter to only include models that support 'text' capability
    const chatModels = models.filter(model =>
      model.capabilities.includes('text')
    );

    res.json({
      success: true,
      models: chatModels
    });
  } catch (error) {
    console.error('Error fetching chat models:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch chat models'
    });
  }
});

module.exports = router;