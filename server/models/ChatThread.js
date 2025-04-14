const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatThreadSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Thread name is required'],
    trim: true
  },
  chatbotId: {
    type: Schema.Types.ObjectId,
    ref: 'Chatbot',
    required: [true, 'Chatbot is required']
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  lastMessage: {
    type: String,
    trim: true
  },
  lastMessageAt: {
    type: Date
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
chatThreadSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('ChatThread', chatThreadSchema);