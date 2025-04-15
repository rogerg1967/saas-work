const { processOpenAIRequest } = require('./openaiService');
const { processAnthropicRequest } = require('./anthropicService');
const { getLLMSettings } = require('./llmSettingsService');

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * Helper function to pause execution
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Send a request to an LLM with optional file attachment
 * @param {string} provider - The AI provider (e.g., 'openai')
 * @param {string} model - The model to use
 * @param {string} prompt - The user's message
 * @param {Array} history - Previous conversation history
 * @param {string} filePath - Path to an uploaded file (optional)
 * @param {string} fileType - Type of file ('image' or 'document')
 * @returns {Promise<string>} - The AI's response
 */
async function sendLLMRequest(provider, model, prompt, history = [], filePath = null, fileType = null) {
  console.log("Sending request to", provider, "using model", model);
  console.log("Prompt:", prompt ? prompt.substring(0, 50) + "..." : "Empty");
  console.log("File:", filePath ? "Yes" : "No", "Type:", fileType || "None");

  if (filePath) {
    // Determine file type if not provided
    if (!fileType) {
      const path = require('path');
      const ext = path.extname(filePath).toLowerCase();

      if (ext.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) {
        fileType = 'image';
      } else if (ext.match(/\.(pdf|doc|docx|txt|rtf|odt|xls|xlsx|csv|ppt|pptx)$/i)) {
        fileType = 'document';
      } else {
        fileType = 'unknown';
      }

      console.log("Determined file type:", fileType);
    }
  }

  let retries = 0;
  const maxRetries = MAX_RETRIES;

  while (retries < maxRetries) {
    try {
      // Get the LLM settings
      const settings = await getLLMSettings();

      // Initialize the appropriate client based on the provider
      let response;

      if (provider.toLowerCase() === 'openai') {
        response = await processOpenAIRequest(model, prompt, history, filePath, fileType, settings);
      } else if (provider.toLowerCase() === 'anthropic') {
        response = await processAnthropicRequest(model, prompt, history, filePath, fileType, settings);
      } else {
        throw new Error("Unsupported provider: " + provider);
      }

      console.log("Successfully received response from", provider);
      return response;
    } catch (error) {
      retries++;
      console.error("Attempt", retries + "/" + maxRetries, "failed:", error.message);

      if (retries >= maxRetries) {
        throw new Error("Failed to get response after " + maxRetries + " attempts: " + error.message);
      }

      // Wait before retrying
      await sleep(RETRY_DELAY * retries);
    }
  }
}

module.exports = {
  sendLLMRequest
};