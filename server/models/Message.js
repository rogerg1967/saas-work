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
    type: String, // URL or path to the image
    default: null
  },
  document: {
    type: String, // URL or path to the document
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Static methods for the Message model
messageSchema.statics.getByChatbotAndThread = async function(chatbotId, threadId) {
  try {
    console.log(`Fetching messages for chatbot: ${chatbotId} and thread: ${threadId}`);
    const messages = await this.find({ chatbotId, threadId })
      .sort({ timestamp: 1 })
      .lean();
    return messages;
  } catch (error) {
    console.error(`Error getting messages by chatbot and thread: ${error.message}`, error);
    throw error;
  }
};

messageSchema.statics.getConversationHistory = async function(chatbotId, threadId, limit = 10) {
  try {
    console.log(`Fetching conversation history for chatbot: ${chatbotId}, thread: ${threadId}, limit: ${limit}`);

    // Make sure threadId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(threadId)) {
      console.error(`Invalid threadId: ${threadId}`);
      throw new Error(`Invalid threadId: ${threadId}`);
    }

    const messages = await this.find({ chatbotId, threadId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .sort({ timestamp: 1 });

    console.log(`Retrieved ${messages.length} messages for conversation history with thread ${threadId}`);
    return messages;
  } catch (error) {
    console.error(`Error fetching conversation history: ${error.message}`, error);
    throw error;
  }
};

module.exports = mongoose.model('Message', messageSchema);