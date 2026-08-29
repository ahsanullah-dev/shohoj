const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Regular text message, image attachment, OR payment card
    type: {
      type: String,
      enum: ['text', 'image', 'payment'],
      default: 'text',
    },
    text: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },

    // Only used when type === 'payment'. Snapshot of the linked Payment for easy render.
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', MessageSchema);
