const axios = require('axios');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const LLMSettings = require('../models/LLMSettings');

dotenv.config();

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Don't initialize clients immediately
let openaiClient = null;
let anthropicClient = null;
let cachedSettings = null;
let lastSettingsFetch = 0;
const SETTINGS_CACHE_TTL = 60000; // 1 minute cache TTL

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch LLM settings from database with caching
async function getLLMSettings() {
  const now = Date.now();

  // Return cached settings if they exist and aren't expired
  if (cachedSettings && (now - lastSettingsFetch) < SETTINGS_CACHE_TTL) {
    return cachedSettings;
  }

  try {
    console.log('Fetching LLM settings from database');
    // Get the first settings document (we assume there's only one global settings document)
    const settings = await LLMSettings.findOne({});

    if (!settings) {
      console.warn('No LLM settings found in database');
      return null;
    }

    // Update cache
    cachedSettings = settings;
    lastSettingsFetch = now;

    return settings;
  } catch (error) {
    console.error('Error fetching LLM settings:', error.message);
    return null;
  }
}

// Initialize OpenAI client only when needed
async function getOpenAIClient() {
  if (openaiClient) return openaiClient;

  try {
    // First try to get API key from database
    const settings = await getLLMSettings();
    let apiKey = settings?.openaiApiKey;

    // Fall back to environment variable if not found in database
    if (!apiKey) {
      apiKey = process.env.OPENAI_API_KEY;
      console.log('Using OpenAI API key from environment variables');
    } else {
      console.log('Using OpenAI API key from database settings');
    }

    if (!apiKey) {
      console.warn('OpenAI API key is missing from both database and environment variables');
      // Return a dummy client that throws appropriate errors when used
      return {
        chat: {
          completions: {
            create: () => {
              throw new Error('OpenAI API key is not configured. Please add it in the LLM Settings page or in your .env file.');
            }
          }
        }
      };
    }

    openaiClient = new OpenAI({ apiKey });
    return openaiClient;
  } catch (error) {
    console.error('Error initializing OpenAI client:', error.message);
    throw error;
  }
}

// Initialize Anthropic client only when needed
async function getAnthropicClient() {
  if (anthropicClient) return anthropicClient;

  try {
    // First try to get API key from database
    const settings = await getLLMSettings();
    let apiKey = settings?.anthropicApiKey;

    // Fall back to environment variable if not found in database
    if (!apiKey) {
      apiKey = process.env.ANTHROPIC_API_KEY;
      console.log('Using Anthropic API key from environment variables');
    } else {
      console.log('Using Anthropic API key from database settings');
    }

    if (!apiKey) {
      console.warn('Anthropic API key is missing from both database and environment variables');
      // Return a dummy client that throws appropriate errors when used
      return {
        messages: {
          create: () => {
            throw new Error('Anthropic API key is not configured. Please add it in the LLM Settings page or in your .env file.');
          }
        }
      };
    }

    anthropicClient = new Anthropic({ apiKey });
    return anthropicClient;
  } catch (error) {
    console.error('Error initializing Anthropic client:', error.message);
    throw error;
  }
}

async function sendRequestToOpenAI(model, message) {
  const client = await getOpenAIClient();

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await client.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: message }],
        max_tokens: 1024,
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error(`Error sending request to OpenAI (attempt ${i + 1}):`, error.message, error.stack);
      if (i === MAX_RETRIES - 1) throw error;
      await sleep(RETRY_DELAY);
    }
  }
}

async function sendRequestToAnthropic(model, message) {
  const client = await getAnthropicClient();

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      console.log(`Sending request to Anthropic with model: ${model} and message: ${message}`);
      const response = await client.messages.create({
        model: model,
        messages: [{ role: 'user', content: message }],
        max_tokens: 1024,
      });
      console.log(`Received response from Anthropic: ${JSON.stringify(response.content)}`);
      return response.content[0].text;
    } catch (error) {
      console.error(`Error sending request to Anthropic (attempt ${i + 1}):`, error.message, error.stack);
      if (i === MAX_RETRIES - 1) throw error;
      await sleep(RETRY_DELAY);
    }
  }
}

async function sendLLMRequest(provider, model, message) {
  console.log(`Sending LLM request to ${provider} with model ${model}`);

  try {
    switch (provider.toLowerCase()) {
      case 'openai':
        return await sendRequestToOpenAI(model, message);
      case 'anthropic':
        return await sendRequestToAnthropic(model, message);
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  } catch (error) {
    console.error(`LLM request failed: ${error.message}`);
    // Return a default message instead of crashing
    return "I'm sorry, I encountered an error processing your request. The AI service may not be properly configured.";
  }
}

// Function to invalidate cached clients when settings change
function invalidateClients() {
  openaiClient = null;
  anthropicClient = null;
  cachedSettings = null;
  lastSettingsFetch = 0;
  console.log('LLM clients invalidated due to settings change');
}

module.exports = {
  sendLLMRequest,
  invalidateClients
};