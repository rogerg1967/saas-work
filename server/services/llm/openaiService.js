const { getOpenAIClient } = require('./clientProviders');
const { formatHistoryForOpenAI } = require('./conversationFormatter');
const { imageToBase64 } = require('./imageProcessor');
const { processDocument } = require('./documentProcessor');

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
  console.log("Processing OpenAI request with model:", model);

  try {
    // For OpenAI, we need to handle different file types differently
    if (filePath) {
      if (fileType === 'image') {
        console.log("Processing image:", filePath);
        // Check if the model supports image analysis
        const { modelSupportsVision } = require('./conversationFormatter');
        const supportsImages = modelSupportsVision(model, 'openai');

        if (!supportsImages) {
          return "I notice you've uploaded an image, but the current model (" + model + ") doesn't support image analysis. Please try using a vision-capable model like GPT-4 Vision or GPT-4o.";
        }

        try {
          const openai = await getOpenAIClient();

          // Read and convert image to base64
          console.log("Converting image to base64");
          const base64Image = await imageToBase64(filePath);
          console.log("Image converted successfully");

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
                    url: "data:image/jpeg;base64," + base64Image
                  }
                }
              ]
            }
          ];

          console.log("Sending image analysis request to OpenAI");
          const response = await openai.chat.completions.create({
            model: model,
            messages: messages,
            max_tokens: 1024,
          });

          console.log("Received image analysis response from OpenAI");
          return response.choices[0].message.content;
        } catch (imageError) {
          console.error("Error analyzing image with OpenAI:", imageError.message);
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

          // Send to OpenAI
          const openai = await getOpenAIClient();
          console.log("Sending document analysis request to OpenAI");

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

          console.log("Received document analysis response from OpenAI");
          return response.choices[0].message.content;
        } catch (docError) {
          console.error("Error analyzing document with OpenAI:", docError.message);
          return "I wasn't able to properly analyze the document you uploaded. Error: " + docError.message;
        }
      }
    }

    // If no file, or unknown file type, just respond to the prompt
    console.log("Processing text-only request to OpenAI");
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
      console.log("Adding", history.length, "messages from conversation history to OpenAI request");
      const formattedHistory = await formatHistoryForOpenAI(history);
      messages = messages.concat(formattedHistory);
    }

    // Add the current message
    messages.push({ role: 'user', content: prompt });

    console.log("Sending text request to OpenAI");
    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
      max_tokens: 1024,
    });

    console.log("Received text response from OpenAI");
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error in OpenAI request processing:", error.message);
    throw error;
  }
}

module.exports = {
  processOpenAIRequest
};