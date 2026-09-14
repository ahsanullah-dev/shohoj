const mongoose = require('mongoose');

// Holds a signup that hasn't confirmed their email yet.
// Nothing here becomes a real User until verify-email succeeds.
// The TTL index below auto-deletes abandoned signups 30 minutes after
// the code was issued, so unverified junk never piles up in the DB.
const PendingSignupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  isRuetVerified: { type: Boolean, default: false },

  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now, expires: 60 * 30 }, // TTL: 30 min
});

module.exports = mongoose.model('PendingSignup', PendingSignupSchema);
