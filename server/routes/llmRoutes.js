const express = require('express');
const router = express.Router();
const LLMSettingsService = require('../services/llmSettingsService');
const AIModelService = require('../services/aiModelService');
const { requireUser } = require('./middleware/auth');

/**
 * @route GET /api/llm/settings
 * @desc Get LLM settings
 * @access Private
 */
router.get('/settings', requireUser, async (req, res) => {
  try {
    console.log('Fetching LLM settings');
    const settings = await LLMSettingsService.getSettings();
    console.log('Successfully retrieved LLM settings');
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching LLM settings:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch LLM settings'
    });
  }
});

/**
 * @route PUT /api/llm/settings
 * @desc Update LLM settings
 * @access Private
 */
router.put('/settings', requireUser, async (req, res) => {
  try {
    console.log('Updating LLM settings');
    const { provider, model, temperature, maxTokens, openaiApiKey, anthropicApiKey } = req.body;

    // Validate input
    if (!provider || !model || temperature === undefined || maxTokens === undefined) {
      console.error('Missing required fields in LLM settings update');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Validate temperature range
    if (temperature < 0 || temperature > 1) {
      console.error(`Invalid temperature value: ${temperature}`);
      return res.status(400).json({
        success: false,
        error: 'Temperature must be between 0 and 1'
      });
    }

    // Validate maxTokens
    if (maxTokens < 1) {
      console.error(`Invalid maxTokens value: ${maxTokens}`);
      return res.status(400).json({
        success: false,
        error: 'Max tokens must be greater than 0'
      });
    }

    const updatedSettings = await LLMSettingsService.updateSettings({
      provider,
      model,
      temperature,
      maxTokens,
      openaiApiKey,
      anthropicApiKey
    });

    console.log('Successfully updated LLM settings');
    res.json({
      success: true,
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Error updating LLM settings:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update LLM settings'
    });
  }
});

/**
 * @route GET /api/llm/models
 * @desc Get available AI models
 * @access Private
 */
router.get('/models', requireUser, (req, res) => {
  try {
    console.log('Fetching available AI models');

    // Get provider from query parameter or return all models
    const { provider } = req.query;
    let models;

    if (provider) {
      models = AIModelService.getModelsByProvider(provider);
      console.log(`Fetched ${models.length} models for provider: ${provider}`);
    } else {
      models = AIModelService.getAvailableModels();
      console.log(`Fetched ${models.length} models from all providers`);
    }

    res.json({
      success: true,
      models
    });
  } catch (error) {
    console.error('Error fetching AI models:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch AI models'
    });
  }
});

/**
 * @route GET /models
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