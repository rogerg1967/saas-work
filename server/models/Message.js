const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  chatbotId: {
    type: Schema.Types.ObjectId,
    ref: 'Chatbot',
    required: [true, 'Chatbot is required']
  },
  threadId: {
    type: Schema.Types.ObjectId,
    ref: 'ChatThread',
    required: [true, 'Thread is required']
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: [true, 'Role is required']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  image: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);