const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  chatbotId: {
    type: Schema.Types.ObjectId,
    ref: 'Chatbot',
    required: [true, 'Chatbot ID is required']
  },
  threadId: {
    type: Schema.Types.ObjectId,
    ref: 'ConversationThread',
    required: [true, 'Thread ID is required']
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: [true, 'Role is required']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  image: {
    type: String, // URL or base64 representation of the image
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);