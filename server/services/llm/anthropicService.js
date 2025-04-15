const { getAnthropicClient } = require('./clientProviders');
const { formatHistoryForAnthropic, modelSupportsVision } = require('./conversationFormatter');
const { imageToBase64 } = require('./imageProcessor');
const { processDocument } = require('./documentProcessor');

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
  console.log("Processing Anthropic request with model:", model);

  try {
    // Map simplified model names to the full Anthropic model IDs
    const modelMap = {
      'claude-3-opus': 'claude-3-opus-20240229',
      'claude-3-sonnet': 'claude-3-sonnet-20240229',
      'claude-3-haiku': 'claude-3-haiku-20240307',
      'claude-2': 'claude-2.1'
    };

    const fullModelName = modelMap[model] || model;
    console.log("Using Anthropic model:", fullModelName);

    const anthropic = await getAnthropicClient();

    // For Anthropic, handle different file types
    if (filePath) {
      if (fileType === 'image') {
        console.log("Processing image:", filePath);
        // Check if the model supports image analysis
        const supportsImages = modelSupportsVision(model, 'anthropic');
        if (!supportsImages) {
          return "I notice you've uploaded an image, but the current model (" + model + ") doesn't support image analysis. Please try using Claude 3, which has vision capabilities.";
        }

        try {
          // Read and convert image to base64
          console.log("Converting image to base64");
          const base64Image = await imageToBase64(filePath);
          console.log("Image converted successfully");

          // Initialize messages array
          let messages = [];

          // Add conversation history if provided
          if (history && history.length > 0) {
            console.log("Adding", history.length, "messages from conversation history to Anthropic request");
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

          console.log("Sending image analysis request to Anthropic");
          const response = await anthropic.messages.create({
            model: fullModelName,
            messages: messages,
            max_tokens: 1024,
            system: 'You are a helpful assistant that analyzes images accurately.'
          });

          console.log("Received image analysis response from Anthropic");
          return response.content[0].text;
        } catch (imageError) {
          console.error("Error analyzing image with Anthropic:", imageError.message);
          return "I wasn't able to properly analyze the image you uploaded. Error: " + imageError.message;
        }
      } else if (fileType === 'document') {
        console.log("Processing document:", filePath);
        try {
          // Process the document
          const document = await processDocument(filePath);
          console.log("Document processed, building prompt");

          // For text-based documents, we can include the content in the prompt
          let documentPrompt = prompt || "Please analyze this document.";
          documentPrompt += "\n\nDocument Information:\nFilename: " + document.fileName + "\nType: " + document.fileType + "\n\nContent: " + document.content + "\n\nPlease analyze this document and provide insights.";

          console.log("Document prompt created, length:", documentPrompt.length, "characters");

          // Initialize messages array
          let messages = [];

          // Add conversation history if provided
          if (history && history.length > 0) {
            console.log("Adding", history.length, "messages from conversation history to Anthropic request");
            const formattedHistory = await formatHistoryForAnthropic(history);
            messages = formattedHistory;
          }

          // Add current user message with document to messages
          messages.push({
            role: 'user',
            content: [{ type: 'text', text: documentPrompt }]
          });

          console.log("Sending document analysis request to Anthropic");
          const response = await anthropic.messages.create({
            model: fullModelName,
            messages: messages,
            max_tokens: 1024,
            system: 'You are a helpful assistant that analyzes documents accurately.'
          });

          console.log("Received document analysis response from Anthropic");
          return response.content[0].text;
        } catch (docError) {
          console.error("Error analyzing document with Anthropic:", docError.message);
          return "I wasn't able to properly analyze the document you uploaded. Error: " + docError.message;
        }
      }
    }

    // If no file, or unknown file type, just respond to the prompt
    console.log("Processing text-only request to Anthropic");

    // Initialize messages array
    let messages = [];

    // Add conversation history if provided
    if (history && history.length > 0) {
      console.log("Adding", history.length, "messages from conversation history to Anthropic request");
      const formattedHistory = await formatHistoryForAnthropic(history);
      messages = formattedHistory;
    }

    // Add the current message
    messages.push({ role: 'user', content: [{ type: 'text', text: prompt }] });

    console.log("Sending text request to Anthropic");
    const response = await anthropic.messages.create({
      model: fullModelName,
      messages: messages,
      max_tokens: 1024,
      system: 'You are a helpful assistant that provides accurate, concise, and thoughtful responses.'
    });

    console.log("Received text response from Anthropic");
    return response.content[0].text;
  } catch (error) {
    console.error("Error in Anthropic request processing:", error.message, error.stack);
    throw error;
  }
}

module.exports = {
  processAnthropicRequest
};