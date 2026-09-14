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

    // Required for email/password accounts. Left blank for Google-only sign-ins.
    passwordHash: { type: String, default: '' },

    // Set when the account was created (or linked) via "Continue with Google".
    googleId: { type: String, default: '', index: true, sparse: true },

    isRuetVerified: {
      type: Boolean,
      default: false,
      index: true
    },

    // Multi-university support
    universityTag: { type: String, default: '', index: true }, // e.g. "RUET", "BUET", "VU", etc.
    universityName: { type: String, default: '' },
    universityVerified: { type: Boolean, default: false, index: true },

    // Email verification — true once they've completed the signup code flow
    // (or signed in with Google, which auto-verifies).
    emailVerified: {
      type: Boolean,
      default: false,
      index: true
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
    universityTag: this.universityTag || (this.isRuetVerified ? 'RUET' : ''),
    universityName: this.universityName || (this.isRuetVerified ? 'Rajshahi University of Engineering & Technology' : ''),
    universityVerified: this.universityVerified || this.isRuetVerified,
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