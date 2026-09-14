const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound unique index so a user cannot save/favorite a post more than once
FavoriteSchema.index({ post: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);
