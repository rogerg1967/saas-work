const { sendLLMRequest } = require('./llmRequestService');
const { processDocument } = require('./documentProcessor');
const { imageToBase64, getFullImageUrl } = require('./imageProcessor');

module.exports = {
  sendLLMRequest,
  processDocument,
  imageToBase64,
  getFullImageUrl
};