const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatbotSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Chatbot name is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'AI model is required'],
    trim: true
  },
  provider: {
    type: String,
    required: [true, 'AI provider is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'Organization is required']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
chatbotSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Chatbot', chatbotSchema);