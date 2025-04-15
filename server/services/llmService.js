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
    // Check if the path is a URL (starts with http:// or https://)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      // Extract the filename from the URL
      const urlParts = imagePath.split('/');
      const filename = urlParts[urlParts.length - 1];

      // Construct the local path to the file in the uploads directory
      const localPath = path.join(__dirname, '..', 'uploads', filename);

      console.log(`Image path is a URL. Extracted filename: ${filename}`);
      console.log(`Looking for file at local path: ${localPath}`);

      // Check if file exists at the local path
      if (!fs.existsSync(localPath)) {
        console.error(`Image file not found at local path: ${localPath}`);
        throw new Error(`Image file not found at local path: ${localPath}`);
      }

      // Read the file as a buffer
      const imageBuffer = await fs.promises.readFile(localPath);
      console.log(`Successfully read image file from local path, size: ${imageBuffer.length} bytes`);

      // Convert to base64
      const base64Image = imageBuffer.toString('base64');
      console.log(`Successfully converted image to base64, length: ${base64Image.length}`);

      return base64Image;
    } else {
      // Handle relative paths by making them absolute (original code)
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
    }
  } catch (error) {
    console.error(`Error converting image to base64: ${error.message}`);
    throw error;
  }
}

/**
 * Gets the full URL for an image, either as a base64 data URI or a server URL
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} Full image URL
 */
async function getFullImageUrl(imagePath) {
  try {
    // For local files, convert to base64
    const base64Image = await imageToBase64(imagePath);
    return `data:image/jpeg;base64,${base64Image}`;
  } catch (error) {
    console.error(`Error getting full image URL: ${error.message}`, error);
    throw error;
  }
}

/**
 * Checks if a model supports vision capabilities
 * @param {string} model - The model name
 * @param {string} provider - The provider name
 * @returns {Promise<boolean>} Whether the model supports vision
 */
async function modelSupportsVision(model, provider) {
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

async function sendRequestToOpenAI(model, message, history = [], imagePath = null) {
  const client = await getOpenAIClient();

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      // Initialize messages array with system message
      let messages = [
        {
          role: 'system',
          content: 'You are a helpful assistant that provides accurate, concise, and thoughtful responses.'
        }
      ];

      // Add conversation history if provided
      if (history && history.length > 0) {
        console.log(`Adding ${history.length} messages from conversation history to OpenAI request`);
        const formattedHistory = await formatHistoryForOpenAI(history);
        messages = messages.concat(formattedHistory);
      }

      // Handle image if present
      if (imagePath) {
        console.log(`Processing image for OpenAI: ${imagePath}`);
        // Only GPT-4 Vision models support image input
        if (model.includes('gpt-4') || model.includes('gpt-4o')) {
          try {
            // Read and convert image to base64
            const base64Image = await imageToBase64(imagePath);

            // Format message with image for vision-capable models
            messages.push({
              role: 'user',
              content: [
                { type: 'text', text: message || 'Please analyze this image.' },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            });
            console.log('Successfully prepared image for OpenAI analysis');
          } catch (imageError) {
            console.error('Error processing image for OpenAI:', imageError);
            // Fall back to text-only if image processing fails
            messages.push({
              role: 'user',
              content: `${message} (Note: I tried to share an image with you, but there was an error processing it)`
            });
          }
        } else {
          // For non-vision models, just mention the image in the text
          messages.push({
            role: 'user',
            content: `${message} (Note: The user uploaded an image, but I cannot view it with my current configuration. Please use GPT-4 Vision for image analysis.)`
          });
        }
      } else {
        // Standard text message (no image)
        messages.push({ role: 'user', content: message });
      }

      console.log(`Sending request to OpenAI with model: ${model} and ${messages.length} messages`);
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

async function sendRequestToAnthropic(model, message, history = [], imagePath = null) {
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
      // Initialize messages array
      let messages = [];

      // Add conversation history if provided
      if (history && history.length > 0) {
        console.log(`Adding ${history.length} messages from conversation history to Anthropic request`);
        const formattedHistory = await formatHistoryForAnthropic(history);
        messages = formattedHistory;
      }

      let messageContent = [];

      // Handle image for Claude 3 models (which support images)
      if (imagePath && fullModelName.includes('claude-3')) {
        console.log(`Processing image for Anthropic: ${imagePath}`);
        try {
          // Read and convert image to base64
          const base64Image = await imageToBase64(imagePath);

          // Format content with image for Claude
          messageContent = [
            { type: 'text', text: message || 'Please analyze this image.' },
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

      // Add current user message to history
      messages.push({ role: 'user', content: messageContent });

      console.log(`Sending request to Anthropic with model: ${fullModelName} (mapped from ${model}) and ${messages.length} messages`);

      const response = await client.messages.create({
        model: fullModelName,
        messages: messages,
        max_tokens: 1024,
        system: 'You are a helpful assistant that provides accurate, concise, and thoughtful responses.'
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
  console.log(`Sending request to ${provider} using model ${model}`);
  console.log(`Prompt: ${prompt.substring(0, 50)}...`);
  console.log(`File: ${filePath ? 'Yes' : 'No'}, Type: ${fileType || 'None'}`);

  let retries = 0;
  const maxRetries = 3;

  while (retries < maxRetries) {
    try {
      // Get the LLM settings
      const LLMSettingsService = require('./llmSettingsService');
      const settings = await LLMSettingsService.getSettings();

      // Initialize the appropriate client based on the provider
      let response;

      if (provider.toLowerCase() === 'openai') {
        response = await processOpenAIRequest(model, prompt, history, filePath, fileType, settings);
      } else if (provider.toLowerCase() === 'anthropic') {
        response = await processAnthropicRequest(model, prompt, history, filePath, fileType, settings);
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      console.log(`Successfully received response from ${provider}`);
      return response;
    } catch (error) {
      retries++;
      console.error(`Attempt ${retries}/${maxRetries} failed: ${error.message}`);

      if (retries >= maxRetries) {
        throw new Error(`Failed to get response after ${maxRetries} attempts: ${error.message}`);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    }
  }
}

/**
 * Process a request using OpenAI
 * @param {string} model - The OpenAI model to use
 * @param {string} prompt - The user's message
 * @param {Array} history - Previous conversation history
 * @param {string} filePath - Path to an uploaded file (optional)
 * @param {string} fileType - Type of file ('image' or 'document')
 * @param {Object} settings - LLM settings
 * @returns {Promise<string>} - The AI's response
 */
async function processOpenAIRequest(model, prompt, history, filePath, fileType, settings) {
  console.log(`Processing OpenAI request with model: ${model}`);

  // For now, we'll mock the OpenAI response
  // In a real implementation, this would use the OpenAI API client

  // Mock different responses based on file type
  if (filePath) {
    if (fileType === 'image') {
      console.log(`Processing image: ${filePath}`);
      return mockImageAnalysisResponse(filePath, prompt);
    } else if (fileType === 'document') {
      console.log(`Processing document: ${filePath}`);
      return mockDocumentAnalysisResponse(filePath, prompt);
    }
  }

  // If no file, or unknown file type, just respond to the prompt
  return mockTextResponse(prompt, history);
}

/**
 * Process a request using Anthropic
 * @param {string} model - The Anthropic model to use
 * @param {string} prompt - The user's message
 * @param {Array} history - Previous conversation history
 * @param {string} filePath - Path to an uploaded file (optional)
 * @param {string} fileType - Type of file ('image' or 'document')
 * @param {Object} settings - LLM settings
 * @returns {Promise<string>} - The AI's response
 */
async function processAnthropicRequest(model, prompt, history, filePath, fileType, settings) {
  console.log(`Processing Anthropic request with model: ${model}`);

  // For now, we'll mock the Anthropic response
  // In a real implementation, this would use the Anthropic API client

  // Mock different responses based on file type
  if (filePath) {
    if (fileType === 'image') {
      console.log(`Processing image: ${filePath}`);
      return mockImageAnalysisResponse(filePath, prompt);
    } else if (fileType === 'document') {
      console.log(`Processing document: ${filePath}`);
      return mockDocumentAnalysisResponse(filePath, prompt);
    }
  }

  // If no file, or unknown file type, just respond to the prompt
  return mockTextResponse(prompt, history);
}

/**
 * Mock response for image analysis
 * @param {string} imagePath - Path to the image
 * @param {string} prompt - The user's message
 * @returns {string} - Mocked AI response
 */
function mockImageAnalysisResponse(imagePath, prompt) {
  const fileName = imagePath.split('/').pop();

  return `I've analyzed the image you uploaded (${fileName}).

Based on what I can see, this appears to be [description of image content].
${prompt ? `Regarding your question: "${prompt}", I can tell you that...` : ''}

Is there anything specific about this image you'd like me to explain further?`;
}

/**
 * Mock response for document analysis
 * @param {string} documentPath - Path to the document
 * @param {string} prompt - The user's message
 * @returns {string} - Mocked AI response
 */
function mockDocumentAnalysisResponse(documentPath, prompt) {
  const fileName = documentPath.split('/').pop();
  const fileExtension = fileName.split('.').pop().toLowerCase();

  let documentType = 'document';
  switch (fileExtension) {
    case 'pdf':
      documentType = 'PDF document';
      break;
    case 'doc':
    case 'docx':
      documentType = 'Word document';
      break;
    case 'txt':
      documentType = 'text file';
      break;
    case 'xls':
    case 'xlsx':
      documentType = 'Excel spreadsheet';
      break;
    case 'csv':
      documentType = 'CSV file';
      break;
    case 'ppt':
    case 'pptx':
      documentType = 'PowerPoint presentation';
      break;
  }

  return `I've analyzed the ${documentType} you uploaded (${fileName}).

The document appears to contain information about [mock summary of document content].
Key points from the document:
1. [First key point]
2. [Second key point]
3. [Third key point]

${prompt ? `Regarding your question: "${prompt}", based on the document content, I can tell you that...` : ''}

Would you like me to focus on any specific part of this document?`;
}

/**
 * Mock response for text-only prompts
 * @param {string} prompt - The user's message
 * @param {Array} history - Previous conversation history
 * @returns {string} - Mocked AI response
 */
function mockTextResponse(prompt, history) {
  // Check if there's any history
  const hasHistory = history && history.length > 0;

  if (hasHistory) {
    return `Based on our conversation so far, I understand you're asking about "${prompt}".

Here's my response taking into account our previous exchanges...`;
  } else {
    return `Thank you for your message: "${prompt}".

Here's my response...`;
  }
}

/**
 * Send a request to an LLM with conversation history
 * @param {string} provider - The LLM provider (e.g., 'openai', 'anthropic')
 * @param {string} model - The model to use
 * @param {string} prompt - The user's prompt
 * @param {Array} history - Conversation history
 * @param {string} imagePath - Optional image path
 * @returns {Promise<string>} The LLM response
 */
async function sendLLMRequestWithHistory(provider, model, prompt, history = [], imagePath = null) {
  try {
    console.log(`Sending LLM request to ${provider} using model ${model}`);
    console.log(`With conversation history: ${history.length} messages`);

    // Log the first few messages of history for debugging
    if (history.length > 0) {
      console.log(`History sample (first ${Math.min(3, history.length)} messages):`);
      history.slice(0, 3).forEach((msg, i) => {
        console.log(`[${i}] Role: ${msg.role}, Content: ${typeof msg.content === 'string' ? msg.content.substring(0, 50) + '...' : '[Complex content]'}`);
      });
    }

    // Get LLM settings
    const settings = await getLLMSettings();

    // Send the request to the appropriate provider
    let response;

    if (provider.toLowerCase() === 'openai') {
      response = await sendRequestToOpenAI(model, prompt, history, imagePath);
    } else if (provider.toLowerCase() === 'anthropic') {
      response = await sendRequestToAnthropic(model, prompt, history, imagePath);
    } else {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    return response;
  } catch (error) {
    console.error(`Error sending LLM request with history: ${error.message}`, error);
    throw error;
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
  sendLLMRequestWithHistory,
  invalidateClients
};