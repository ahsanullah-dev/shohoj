const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    passwordHash: { type: String, required: true },

    isRuetVerified: {
      type: Boolean,
      default: false,
      index: true
    },

    // Access role. 'admin' can moderate posts/users and resolve reports.
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },

    // Moderation: banned users cannot post or message.
    isBanned: { type: Boolean, default: false, index: true },

    // Bookmarked posts (saved list shown on the dashboard).
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],

    // Users this person has blocked (no new conversations from them).
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Email verification
    emailVerified: {
      type: Boolean,
      default: false,
      index: true
    },

    // Hashed 6-digit verification code
    emailVerificationCodeHash: {
      type: String,
      default: ''
    },

    // Verification code expiration time
    emailVerificationExpires: {
      type: Date,
      default: null
    },

    // Number of incorrect verification attempts
    emailVerificationAttempts: {
      type: Number,
      default: 0
    },

    // Optional profile
    department: { type: String, default: '' }, // e.g. CSE, EEE, ME
    batch: { type: String, default: '' },      // e.g. 2021
    hall: { type: String, default: '' },       // e.g. Sher-e-Bangla Hall
    bio: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    avatarPublicId: { type: String, default: '' },

    // Optional contact channels for payment (never required)
    bkashNumber: { type: String, default: '' },
    nagadNumber: { type: String, default: '' },
  },
  { timestamps: true }
);

UserSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    isRuetVerified: this.isRuetVerified,
    emailVerified: this.emailVerified,
    department: this.department,
    batch: this.batch,
    hall: this.hall,
    bio: this.bio,
    avatarUrl: this.avatarUrl,
    role: this.role,
    isBanned: this.isBanned,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', UserSchema);