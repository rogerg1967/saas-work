```
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

      console.log("Image path is a URL. Extracted filename:", filename);
      console.log("Looking for file at local path:", localPath);

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
    }
  } catch (error) {
    console.error(`Error converting image to base64: ${error.message}`);
    throw error;
  }
}

/**
 * Extract text content from document files for analysis
 * @param {string} documentPath - Path to the document file
 * @returns {Promise<string>} Extracted text content
 */
async function extractDocumentContent(documentPath) {
  try {
    console.log(`Extracting content from document: ${documentPath}`);

    // Check if file exists
    if (!fs.existsSync(documentPath)) {
      console.error(`Document file not found at path: ${documentPath}`);
      return `[Document file not found: ${path.basename(documentPath)}]`;
    }

    // Get file extension to determine document type
    const ext = path.extname(documentPath).toLowerCase();
    console.log(`Document type detected as: ${ext}`);

    // For text files, read directly
    if (ext === '.txt') {
      console.log('Processing as text file');
      const content = await fs.promises.readFile(documentPath, 'utf8');
      console.log(`Successfully extracted text content, length: ${content.length} characters`);
      return content.slice(0, 5000); // Limit content length
    }

    // For other document types in this MVP version, we read as binary and report file type
    // In a production environment, specific document parsers would be used
    console.log(`Processing document with extension: ${ext}`);
    const fileStats = await fs.promises.stat(documentPath);
    const fileSizeKB = Math.round(fileStats.size / 1024);

    return `[This is a ${ext.replace('.', '')} document with file size of ${fileSizeKB}KB. The document appears to contain formatted content that requires specialized parsing. In a production environment, a dedicated parser for ${ext} files would extract the full content.]`;
  } catch (error) {
    console.error(`Error extracting document content: ${error.message}`, error);
    return `[Error extracting document content: ${error.message}]`;
  }
}

/**
 * Process a document for LLM analysis
 * @param {string} documentPath - Path to the document file
 * @returns {Promise<Object>} Document content and metadata
 */
async function processDocument(documentPath) {
  try {
    console.log(`Processing document: ${documentPath}`);

    if (!documentPath) {
      console.error('Document path is null or undefined');
      throw new Error('Invalid document path');
    }

    const fileName = path.basename(documentPath);
    const fileExt = path.extname(documentPath).toLowerCase();

    console.log(`Processing document: ${fileName} (${fileExt})`);

    // Extract document content
    const content = await extractDocumentContent(documentPath);

    console.log(`Document processing complete for: ${fileName}`);
    return {
      fileName,
      fileType: fileExt.replace('.', ''),
      content
    };
  } catch (error) {
    console.error(`Error processing document: ${error.message}`, error);
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

  try {
    // For OpenAI, we need to handle different file types differently
    if (filePath) {
      if (fileType === 'image') {
        console.log(`Processing image: ${filePath}`);
        // Check if the model supports image analysis
        const supportsImages = await modelSupportsVision(model, 'openai');
        if (!supportsImages) {
          return `I notice you've uploaded an image, but the current model (${model}) doesn't support image analysis. Please try using a vision-capable model like GPT-4 Vision or GPT-4o.`;
        }

        try {
          const openai = await getOpenAIClient();

          // Read and convert image to base64
          console.log('Converting image to base64');
          const base64Image = await imageToBase64(filePath);
          console.log('Image converted successfully');

          // Prepare messages for OpenAI with image
          const messages = [
            {
              role: 'system',
              content: 'You are a helpful assistant that analyzes images accurately.'
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt || 'Please analyze this image.' },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ];

          console.log('Sending image analysis request to OpenAI');
          const response = await openai.chat.completions.create({
            model: model,
            messages: messages,
            max_tokens: 1024,
          });

          console.log('Received image analysis response from OpenAI');
          return response.choices[0].message.content;
        } catch (imageError) {
          console.error(`Error analyzing image with OpenAI: ${imageError.message}`, imageError);
          return `I wasn't able to properly analyze the image you uploaded. Error: ${imageError.message}`;
        }
      } else if (fileType === 'document') {
        console.log(`Processing document: ${filePath}`);
        try {
          // Process the document
          const document = await processDocument(filePath);
          console.log('Document processed, building prompt');

          // For text-based documents, we can include the content in the prompt
          let documentPrompt = prompt || "Please analyze this document.";
          documentPrompt += `\n\nDocument Information:\nFilename: ${document.fileName}\nType: ${document.fileType}\n\nContent: ${document.content}\n\nPlease analyze this document and provide insights.`;

          console.log(`Document prompt created, length: ${documentPrompt.length} characters`);

          // Send to OpenAI
          const openai = await getOpenAIClient();
          console.log('Sending document analysis request to OpenAI');

          const response = await openai.chat.completions.create({
            model: model,
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant that analyzes documents accurately.'
              },
              {
                role: 'user',
                content: documentPrompt
              }
            ],
            max_tokens: 1024,
          });

          console.log('Received document analysis response from OpenAI');
          return response.choices[0].message.content;
        } catch (docError) {
          console.error(`Error analyzing document with OpenAI: ${docError.message}`, docError);
          return `I wasn't able to properly analyze the document you uploaded. Error: ${docError.message}`;
        }
      }
    }

    // If no file, or unknown file type, just respond to the prompt
    console.log('Processing text-only request to OpenAI');
    const openai = await getOpenAIClient();

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

    // Add the current message
    messages.push({ role: 'user', content: prompt });

    console.log('Sending text request to OpenAI');
    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
      max_tokens: 1024,
    });

    console.log('Received text response from OpenAI');
    return response.choices[0].message.content;
  } catch (error) {
    console.error(`Error in OpenAI request processing: ${error.message}`, error);
    throw error;
  }
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

  try {
    // Map simplified model names to the full Anthropic model IDs
    const modelMap = {
      'claude-3-opus': 'claude-3-opus-20240229',
      'claude-3-sonnet': 'claude-3-sonnet-20240229',
      'claude-3-haiku': 'claude-3-haiku-20240307',
      'claude-2': 'claude-2.1'
    };

    const fullModelName = modelMap[model] || model;
    console.log(`Using Anthropic model: ${fullModelName}`);

    const anthropic = await getAnthropicClient();

    // For Anthropic, handle different file types
    if (filePath) {
      if (fileType === 'image') {
        console.log(`Processing image: ${filePath}`);
        // Check if the model supports image analysis
        const supportsImages = await modelSupportsVision(model, 'anthropic');
        if (!supportsImages) {
          return `I notice you've uploaded an image, but the current model (${model}) doesn't support image analysis. Please try using Claude 3, which has vision capabilities.`;
        }

        try {
          // Read and convert image to base64
          console.log('Converting image to base64');
          const base64Image = await imageToBase64(filePath);
          console.log('Image converted successfully');

          // Initialize messages array
          let messages = [];

          // Add conversation history if provided
          if (history && history.length > 0) {
            console.log(`Adding ${history.length} messages from conversation history to Anthropic request`);
            const formattedHistory = await formatHistoryForAnthropic(history);
            messages = formattedHistory;
          }

          // Create message content with image
          const messageContent = [
            { type: 'text', text: prompt || 'Please analyze this image.' },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image
              }
            }
          ];

          // Add current user message with image to messages
          messages.push({ role: 'user', content: messageContent });

          console.log('Sending image analysis request to Anthropic');
          const response = await anthropic.messages.create({
            model: fullModelName,
            messages: messages,
            max_tokens: 1024,
            system: 'You are a helpful assistant that analyzes images accurately.'
          });

          console.log('Received image analysis response from Anthropic');
          return response.content[0].text;
        } catch (imageError) {
          console.error(`Error analyzing image with Anthropic: ${imageError.message}`, imageError);
          return `I wasn't able to properly analyze the image you uploaded. Error: ${imageError.message}`;
        }
      } else if (fileType === 'document') {
        console.log(`Processing document: ${filePath}`);
        try {
          // Process the document
          const document = await processDocument(filePath);
          console.log('Document processed, building prompt');

          // For text-based documents, we can include the content in the prompt
          let documentPrompt = prompt || "Please analyze this document.";
          documentPrompt += `\n\nDocument Information:\nFilename: ${document.fileName}\nType: ${document.fileType}\n\nContent: ${document.content}\n\nPlease analyze this document and provide insights.`;

          console.log(`Document prompt created, length: ${documentPrompt.length} characters`);

          // Initialize messages array
          let messages = [];

          // Add conversation history if provided
          if (history && history.length > 0) {
            console.log(`Adding ${history.length} messages from conversation history to Anthropic request`);
            const formattedHistory = await formatHistoryForAnthropic(history);
            messages = formattedHistory;
          }

          // Add current user message with document to messages
          messages.push({
            role: 'user',
            content: [{ type: 'text', text: documentPrompt }]
          });

          console.log('Sending document analysis request to Anthropic');
          const response = await anthropic.messages.create({
            model: fullModelName,
            messages: messages,
            max_tokens: 1024,
            system: 'You are a helpful assistant that analyzes documents accurately.'
          });

          console.log('Received document analysis response from Anthropic');
          return response.content[0].text;
        } catch (docError) {
          console.error(`Error analyzing document with Anthropic: ${docError.message}`, docError);
          return `I wasn't able to properly analyze the document you uploaded. Error: ${docError.message}`;
        }
      }
    }

    // If no file, or unknown file type, just respond to the prompt
    console.log('Processing text-only request to Anthropic');

    // Initialize messages array
    let messages = [];

    // Add conversation history if provided
    if (history && history.length > 0) {
      console.log(`Adding ${history.length} messages from conversation history to Anthropic request`);
      const formattedHistory = await formatHistoryForAnthropic(history);
      messages = formattedHistory;
    }

    // Add the current message
    messages.push({ role: 'user', content: [{ type: 'text', text: prompt }] });

    console.log('Sending text request to Anthropic');
    const response = await anthropic.messages.create({
      model: fullModelName,
      messages: messages,
      max_tokens: 1024,
      system: 'You are a helpful assistant that provides accurate, concise, and thoughtful responses.'
    });

    console.log('Received text response from Anthropic');
    return response.content[0].text;
  } catch (error) {
    console.error(`Error in Anthropic request processing: ${error.message}`, error);
    throw error;
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
      // Get settings
      const settings = await getLLMSettings();

      // Route to appropriate provider
      if (provider.toLowerCase() === 'openai') {
        return await processOpenAIRequest(model, prompt, history, filePath, fileType, settings);