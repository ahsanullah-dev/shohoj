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
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', UserSchema);