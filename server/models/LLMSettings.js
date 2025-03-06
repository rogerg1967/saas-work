const mongoose = require('mongoose');

const llmSettingsSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ['openai', 'anthropic'],
    default: 'openai',
    required: true
  },
  model: {
    type: String,
    required: true,
    default: 'gpt-4'
  },
  temperature: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.7,
    required: true
  },
  maxTokens: {
    type: Number,
    min: 1,
    max: 8192,
    default: 2048,
    required: true
  },
  openaiApiKey: {
    type: String,
    default: '',
  },
  anthropicApiKey: {
    type: String,
    default: '',
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  versionKey: false
});

// Update the 'updatedAt' field before saving
llmSettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const LLMSettings = mongoose.model('LLMSettings', llmSettingsSchema);

module.exports = LLMSettings;