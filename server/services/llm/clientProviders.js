const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { getLLMSettings } = require('./llmSettingsService');
const dotenv = require('dotenv');

dotenv.config();

// Don't initialize clients immediately
let openaiClient = null;
let anthropicClient = null;

/**
 * Initialize OpenAI client only when needed
 * @returns {Promise<Object>} The OpenAI client
 */
async function getOpenAIClient() {
  if (openaiClient) return openaiClient;

  try {
    // First try to get API key from database
    const settings = await getLLMSettings();
    let apiKey = settings?.openaiApiKey;

    // Fall back to environment variable if not found in database
    if (!apiKey) {
      apiKey = process.env.OPENAI_API_KEY;
      console.log("Using OpenAI API key from environment variables");
    } else {
      console.log("Using OpenAI API key from database settings");
    }

    if (!apiKey) {
      console.warn("OpenAI API key is missing from both database and environment variables");
      // Return a dummy client that throws appropriate errors when used
      return {
        chat: {
          completions: {
            create: () => {
              throw new Error("OpenAI API key is not configured. Please add it in the LLM Settings page or in your .env file.");
            }
          }
        }
      };
    }

    openaiClient = new OpenAI({ apiKey });
    return openaiClient;
  } catch (error) {
    console.error("Error initializing OpenAI client:", error.message);
    throw error;
  }
}

/**
 * Initialize Anthropic client only when needed
 * @returns {Promise<Object>} The Anthropic client
 */
async function getAnthropicClient() {
  if (anthropicClient) return anthropicClient;

  try {
    // First try to get API key from database
    const settings = await getLLMSettings();
    let apiKey = settings?.anthropicApiKey;

    // Fall back to environment variable if not found in database
    if (!apiKey) {
      apiKey = process.env.ANTHROPIC_API_KEY;
      console.log("Using Anthropic API key from environment variables");
    } else {
      console.log("Using Anthropic API key from database settings");
    }

    if (!apiKey) {
      console.warn("Anthropic API key is missing from both database and environment variables");
      // Return a dummy client that throws appropriate errors when used
      return {
        messages: {
          create: () => {
            throw new Error("Anthropic API key is not configured. Please add it in the LLM Settings page or in your .env file.");
          }
        }
      };
    }

    anthropicClient = new Anthropic({ apiKey });
    return anthropicClient;
  } catch (error) {
    console.error("Error initializing Anthropic client:", error.message);
    throw error;
  }
}

module.exports = {
  getOpenAIClient,
  getAnthropicClient
};