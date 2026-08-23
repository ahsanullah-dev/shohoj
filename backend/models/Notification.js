const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['new_post', 'new_message', 'new_review', 'reported'],
      required: true,
    },
    title: { type: String, required: true },
    body:  { type: String, default: '' },
    link:  { type: String, default: '' },
    read:  { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Keep only the latest 200 notifications per user (TTL via capped collection isn't
// practical here, so we do a lightweight cleanup in the route instead).
NotificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
