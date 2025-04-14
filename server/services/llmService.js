const axios = require('axios');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const LLMSettings = require('../models/LLMSettings');
const fs = require('fs');
const path = require('path');

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

/**
 * Converts an image file path to base64 format for API requests
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} Base64-encoded image data
 */
async function imageToBase64(imagePath) {
  try {
    // Handle relative paths by making them absolute
    const absolutePath = path.resolve(
      imagePath.startsWith('/') ? path.join(__dirname, '..', imagePath) : path.join(__dirname, '../..', imagePath)
    );

    console.log(`Reading image from absolute path: ${absolutePath}`);

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      console.error(`Image file not found at path: ${absolutePath}`);
      throw new Error(`Image file not found at path: ${absolutePath}`);
    }

    // Read the file as a buffer
    const imageBuffer = await fs.promises.readFile(absolutePath);
    console.log(`Successfully read image file, size: ${imageBuffer.length} bytes`);

    // Convert to base64
    const base64Image = imageBuffer.toString('base64');
    console.log(`Successfully converted image to base64, length: ${base64Image.length}`);

    return base64Image;
  } catch (error) {
    console.error(`Error converting image to base64: ${error.message}`);
    throw error;
  }
}

async function sendRequestToOpenAI(model, message, imagePath = null) {
  const client = await getOpenAIClient();

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      let messageContent = message;
      let messages = [];

      // Handle image if present
      if (imagePath) {
        console.log(`Processing image for OpenAI: ${imagePath}`);
        // Only GPT-4 Vision model supports image input
        if (model.includes('gpt-4') && !model.includes('gpt-4o')) {
          try {
            // Read and convert image to base64
            const base64Image = await imageToBase64(imagePath);

            // Format message with image for GPT-4 Vision
            messages = [
              {
                role: 'user',
                content: [
                  { type: 'text', text: message },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/jpeg;base64,${base64Image}`
                    }
                  }
                ]
              }
            ];
            console.log('Successfully prepared image for OpenAI analysis');
          } catch (imageError) {
            console.error('Error processing image for OpenAI:', imageError);
            // Fall back to text-only if image processing fails
            messages = [{
              role: 'user',
              content: `${message} (Note: I tried to share an image with you, but there was an error processing it)`
            }];
          }
        } else {
          // For non-vision models, just mention the image in the text
          messages = [{
            role: 'user',
            content: `${message} (Note: The user uploaded an image, but I cannot view it with my current configuration. Please use GPT-4 Vision for image analysis.)`
          }];
        }
      } else {
        // Standard text message
        messages = [{ role: 'user', content: message }];
      }

      const response = await client.chat.completions.create({
        model: model,
        messages: messages,
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

async function sendRequestToAnthropic(model, message, imagePath = null) {
  const client = await getAnthropicClient();

  // Map simplified model names to the full Anthropic model IDs
  const modelMap = {
    'claude-3-opus': 'claude-3-opus-20240229',
    'claude-3-sonnet': 'claude-3-sonnet-20240229',
    'claude-3-haiku': 'claude-3-haiku-20240307',
    'claude-2': 'claude-2.1'
  };

  const fullModelName = modelMap[model] || model;

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      let messageContent = [];

      // Handle image for Claude 3 models (which support images)
      if (imagePath && fullModelName.includes('claude-3')) {
        console.log(`Processing image for Anthropic: ${imagePath}`);
        try {
          // Read and convert image to base64
          const base64Image = await imageToBase64(imagePath);

          // Format content with image for Claude
          messageContent = [
            { type: 'text', text: message },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image
              }
            }
          ];
          console.log('Successfully prepared image for Anthropic analysis');
        } catch (imageError) {
          console.error('Error processing image for Anthropic:', imageError);
          // Fall back to text-only if image processing fails
          messageContent = [{
            type: 'text',
            text: `${message} (Note: I tried to share an image with you, but there was an error processing it)`
          }];
        }
      } else if (imagePath) {
        // For non-Claude 3 models, just mention the image in the text
        messageContent = [{
          type: 'text',
          text: `${message} (Note: The user uploaded an image, but I cannot view it with my current configuration. Please use Claude 3 for image analysis.)`
        }];
      } else {
        // Standard text message
        messageContent = [{ type: 'text', text: message }];
      }

      console.log(`Sending request to Anthropic with model: ${fullModelName} (mapped from ${model})`);

      const response = await client.messages.create({
        model: fullModelName,
        messages: [{ role: 'user', content: messageContent }],
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

async function sendLLMRequest(provider, model, message, imagePath = null) {
  console.log(`Sending LLM request to ${provider} with model ${model}${imagePath ? ' including image analysis' : ''}`);

  try {
    switch (provider.toLowerCase()) {
      case 'openai':
        return await sendRequestToOpenAI(model, message, imagePath);
      case 'anthropic':
        return await sendRequestToAnthropic(model, message, imagePath);
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  } catch (error) {
    console.error(`LLM request failed: ${error.message}`);
    // Return a default message instead of crashing
    return "I'm sorry, I encountered an error processing your request. The AI service may not be properly configured or may not support image analysis with the current model.";
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