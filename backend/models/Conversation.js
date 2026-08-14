const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ],
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
    lastMessageAt: { type: Date, default: Date.now, index: true },
    lastMessagePreview: { type: String, default: '' },
  },
  { timestamps: true }
);

// Ensure any given pair (+ optional post) has one conversation
ConversationSchema.index({ participants: 1, post: 1 });

module.exports = mongoose.model('Conversation', ConversationSchema);
