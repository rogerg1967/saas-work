const LLMSettings = require('../models/LLMSettings');

class LLMSettingsService {
  /**
   * Get the current LLM settings. If none exist, create default settings.
   * @returns {Promise<Object>} The LLM settings object
   */
  static async getSettings() {
    try {
      console.log('Fetching LLM settings from database');
      // We'll store only one settings document, so we can just take the first one
      let settings = await LLMSettings.findOne();

      // If no settings exist, create default settings
      if (!settings) {
        console.log('No LLM settings found, creating default settings');
        settings = await LLMSettings.create({
          provider: 'openai',
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2048,
          openaiApiKey: '',
          anthropicApiKey: ''
        });
        console.log('Default LLM settings created successfully');
      } else {
        console.log('LLM settings retrieved successfully');
      }

      return settings;
    } catch (error) {
      console.error('Error getting LLM settings:', error);
      throw error;
    }
  }

  /**
   * Update the LLM settings
   * @param {Object} settingsData - The new settings data
   * @returns {Promise<Object>} The updated settings
   */
  static async updateSettings(settingsData) {
    try {
      console.log('Updating LLM settings with data:', {
        ...settingsData,
        openaiApiKey: settingsData.openaiApiKey ? '********' : undefined,
        anthropicApiKey: settingsData.anthropicApiKey ? '********' : undefined
      });

      // Find existing settings or create new one if doesn't exist
      let settings = await LLMSettings.findOne();

      if (!settings) {
        console.log('No existing LLM settings found, creating new settings');
        settings = new LLMSettings();
      }

      // Update fields
      settings.provider = settingsData.provider;
      settings.model = settingsData.model;
      settings.temperature = settingsData.temperature;
      settings.maxTokens = settingsData.maxTokens;

      // Only update API keys if they are provided
      if (settingsData.openaiApiKey) {
        settings.openaiApiKey = settingsData.openaiApiKey;
      }

      if (settingsData.anthropicApiKey) {
        settings.anthropicApiKey = settingsData.anthropicApiKey;
      }

      // Save and return updated settings
      await settings.save();
      console.log('LLM settings updated successfully');
      return settings;
    } catch (error) {
      console.error('Error updating LLM settings:', error);
      throw error;
    }
  }
}

module.exports = LLMSettingsService;