const express = require('express');
const router = express.Router();
const LLMSettingsService = require('../services/llmSettingsService');
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

module.exports = router;