/**
 * Service for managing AI model information
 */
class AIModelService {
  /**
   * Get all available AI models
   * @returns {Array} List of available AI models
   */
  static getAvailableModels() {
    // In a production environment, this might fetch from a database or
    // dynamically from provider APIs.

    const openAIModels = [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        capabilities: ['text', 'images']
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'OpenAI',
        capabilities: ['text']
      },
      {
        id: 'gpt-4-vision-preview',
        name: 'GPT-4 Vision',
        provider: 'OpenAI',
        capabilities: ['text', 'images']
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'OpenAI',
        capabilities: ['text']
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'OpenAI',
        capabilities: ['text']
      },
      {
        id: 'gpt-3.5-turbo-instruct',
        name: 'GPT-3.5 Turbo Instruct',
        provider: 'OpenAI',
        capabilities: ['text']
      },
      {
        id: 'dall-e-3',
        name: 'DALL-E 3',
        provider: 'OpenAI',
        capabilities: ['images']
      },
      {
        id: 'tts-1',
        name: 'TTS-1',
        provider: 'OpenAI',
        capabilities: ['audio']
      },
      {
        id: 'whisper-1',
        name: 'Whisper-1',
        provider: 'OpenAI',
        capabilities: ['audio-transcription']
      }
    ];

    const anthropicModels = [
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        provider: 'Anthropic',
        capabilities: ['text', 'images'],
        apiId: 'claude-3-opus-20240229'
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        provider: 'Anthropic',
        capabilities: ['text', 'images'],
        apiId: 'claude-3-sonnet-20240229'
      },
      {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        provider: 'Anthropic',
        capabilities: ['text', 'images'],
        apiId: 'claude-3-haiku-20240307'
      },
      {
        id: 'claude-2',
        name: 'Claude 2',
        provider: 'Anthropic',
        capabilities: ['text'],
        apiId: 'claude-2.1'
      }
    ];

    return [...openAIModels, ...anthropicModels];
  }

  /**
   * Get models for a specific provider
   * @param {string} provider - The provider name (e.g., 'OpenAI', 'Anthropic')
   * @returns {Array} List of models for the specified provider
   */
  static getModelsByProvider(provider) {
    const allModels = this.getAvailableModels();
    return allModels.filter(model =>
      model.provider.toLowerCase() === provider.toLowerCase()
    );
  }

  /**
   * Get the API model ID for Anthropic models
   * @param {string} modelId - The internal model ID
   * @returns {string} The API model ID to use with Anthropic
   */
  static getAnthropicApiModelId(modelId) {
    const models = this.getAvailableModels();
    const model = models.find(m => m.id === modelId && m.provider === 'Anthropic');
    
    if (model && model.apiId) {
      console.log(`Mapping Anthropic model ${modelId} to API ID ${model.apiId}`);
      return model.apiId;
    }
    
    console.log(`No API ID mapping found for Anthropic model ${modelId}, using as-is`);
    return modelId;
  }
}

module.exports = AIModelService;