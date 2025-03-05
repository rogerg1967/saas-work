const express = require('express');
const router = express.Router();
const ChatbotService = require('../services/chatbotService');
const { requireUser } = require('./middleware/auth');
const { requireSubscription } = require('./middleware/subscriptionCheck');

// Get all chatbots for the user's organization
router.get('/', requireUser, requireSubscription, async (req, res) => {
  try {
    console.log(`Fetching chatbots for organization: ${req.user.organizationId}`);
    const { user } = req;
    const chatbots = await ChatbotService.getByOrganization(user.organizationId);
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

module.exports = router;