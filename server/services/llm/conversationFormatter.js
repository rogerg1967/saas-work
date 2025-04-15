/**
 * Format conversation history for OpenAI
 * @param {Array} history - Conversation history array
 * @returns {Array} Formatted history for OpenAI
 */
async function formatHistoryForOpenAI(history) {
  if (!history || !history.length) return [];

  return history.map(message => ({
    role: message.role,
    content: message.content
  }));
}

/**
 * Format conversation history for Anthropic
 * @param {Array} history - Conversation history array
 * @returns {Array} Formatted history for Anthropic
 */
async function formatHistoryForAnthropic(history) {
  if (!history || !history.length) return [];

  return history.map(message => {
    // Convert message roles if needed (Anthropic expects 'user' and 'assistant')
    const role = message.role === 'system' ? 'assistant' : message.role;

    // Handle text or complex content
    let content;
    if (typeof message.content === 'string') {
      content = [{ type: 'text', text: message.content }];
    } else {
      content = message.content;
    }

    return { role, content };
  });
}

/**
 * Checks if a model supports vision capabilities
 * @param {string} model - The model name
 * @param {string} provider - The provider name
 * @returns {boolean} Whether the model supports vision
 */
function modelSupportsVision(model, provider) {
  // For OpenAI, only GPT-4 Vision models support image input
  if (provider.toLowerCase() === 'openai') {
    return model.includes('gpt-4') || model.includes('gpt-4o');
  }
  // For Anthropic, only Claude 3 models support images
  else if (provider.toLowerCase() === 'anthropic') {
    return model.includes('claude-3');
  }
  return false;
}

module.exports = {
  formatHistoryForOpenAI,
  formatHistoryForAnthropic,
  modelSupportsVision
};