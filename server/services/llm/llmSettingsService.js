const LLMSettings = require('../../models/LLMSettings');

// Cache settings to reduce database queries
let cachedSettings = null;
let lastSettingsFetch = 0;
const SETTINGS_CACHE_TTL = 60000; // 1 minute cache TTL

/**
 * Get LLM settings from database with caching
 * @returns {Promise<Object>} The settings object
 */
async function getLLMSettings() {
  const now = Date.now();

  // Return cached settings if they exist and aren't expired
  if (cachedSettings && (now - lastSettingsFetch) < SETTINGS_CACHE_TTL) {
    return cachedSettings;
  }

  try {
    console.log("Fetching LLM settings from database");
    // Get the first settings document (we assume there's only one global settings document)
    const settings = await LLMSettings.findOne({});

    if (!settings) {
      console.warn("No LLM settings found in database");
      return null;
    }

    // Update cache
    cachedSettings = settings;
    lastSettingsFetch = now;

    return settings;
  } catch (error) {
    console.error("Error fetching LLM settings:", error.message);
    return null;
  }
}

module.exports = {
  getLLMSettings
};