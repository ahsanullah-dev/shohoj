const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PendingSignup = require('../models/PendingSignup');
const { authRequired } = require('../middleware/auth');
const { generateSixDigitCode, sendVerificationEmail } = require('../utils/mailer');
const { verifyGoogleIdToken } = require('../utils/googleAuth');

const router = express.Router();

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_VERIFY_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute between resends

async function issuePendingCode(pending) {
  const code = generateSixDigitCode();
  pending.codeHash = await bcrypt.hash(code, 10);
  pending.expiresAt = new Date(Date.now() + CODE_TTL_MS);
  pending.attempts = 0;
  await pending.save();
  await sendVerificationEmail(pending.email, pending.name, code);
}

function isRuetEmail(email) {
  const domains = (process.env.RUET_EMAIL_DOMAINS || 'student.ruet.ac.bd,ruet.ac.bd')
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
  const lower = String(email || '').toLowerCase();
  return domains.some((d) => lower.endsWith('@' + d));
}

function signToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
}

// POST /api/auth/register
// Does NOT create a User yet — only a PendingSignup. The real account is
// created in /verify-email once the code is confirmed.
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);

    // If they already started signing up but never verified, overwrite the
    // old pending record with a fresh code instead of blocking them.
    let pending = await PendingSignup.findOne({ email: normalizedEmail });
    if (!pending) {
      pending = new PendingSignup({ email: normalizedEmail });
    }
    pending.name = name.trim();
    pending.passwordHash = passwordHash;
    pending.isRuetVerified = isRuetEmail(normalizedEmail);

    await issuePendingCode(pending);

    res.status(200).json({ ok: true, pendingVerification: true, email: normalizedEmail });
  } catch (err) {
    console.error('[auth/register]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/verify-email  { email, code }
// Confirms the code, then creates the real User for the first time.
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body || {};
    if (!email || !code) return res.status(400).json({ error: 'email and code are required' });
    const normalizedEmail = email.toLowerCase().trim();

    // Already a real, verified account? Nothing to do.
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.json({ ok: true, alreadyVerified: true });

    const pending = await PendingSignup.findOne({ email: normalizedEmail });
    if (!pending) {
      return res.status(404).json({ error: 'No pending signup found. Please sign up again.' });
    }
    if (pending.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ error: 'Code expired. Please request a new one.' });
    }
    if (pending.attempts >= MAX_VERIFY_ATTEMPTS) {
      return res.status(429).json({ error: 'Too many attempts. Please request a new code.' });
    }

    const match = await bcrypt.compare(String(code).trim(), pending.codeHash);
    if (!match) {
      pending.attempts += 1;
      await pending.save();
      return res.status(400).json({ error: 'Incorrect code' });
    }

    // Code confirmed — create the real account now, and only now.
    const user = await User.create({
      name: pending.name,
      email: pending.email,
      passwordHash: pending.passwordHash,
      isRuetVerified: pending.isRuetVerified,
      universityTag: pending.isRuetVerified ? 'RUET' : '',
      universityName: pending.isRuetVerified ? 'Rajshahi University of Engineering & Technology' : '',
      universityVerified: Boolean(pending.isRuetVerified),
      emailVerified: true,
    });
    await PendingSignup.deleteOne({ _id: pending._id });

    const token = signToken(user);
    res.json({ ok: true, token, user: user.toPublicJSON() });
  } catch (err) {
    console.error('[auth/verify-email]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/resend-verification  { email }
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: 'email is required' });
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.json({ ok: true, alreadyVerified: true });

    const pending = await PendingSignup.findOne({ email: normalizedEmail });
    if (!pending) return res.status(404).json({ error: 'No pending signup found. Please sign up again.' });

    const lastSentAt = pending.expiresAt.getTime() - CODE_TTL_MS;
    if (Date.now() - lastSentAt < RESEND_COOLDOWN_MS) {
      return res.status(429).json({ error: 'Please wait a moment before requesting another code.' });
    }

    await issuePendingCode(pending);
    res.json({ ok: true });
  } catch (err) {
    console.error('[auth/resend-verification]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/google  { idToken }
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken) return res.status(400).json({ error: 'idToken is required' });

    const g = await verifyGoogleIdToken(idToken);
    const email = g.email.toLowerCase().trim();

    let user = await User.findOne({ $or: [{ googleId: g.googleId }, { email }] });

    if (!user) {
      const isRuet = isRuetEmail(email);
      user = await User.create({
        name: g.name,
        email,
        passwordHash: '', // Google-only account, no password login
        googleId: g.googleId,
        isRuetVerified: isRuet,
        universityTag: isRuet ? 'RUET' : '',
        universityName: isRuet ? 'Rajshahi University of Engineering & Technology' : '',
        universityVerified: Boolean(isRuet),
        emailVerified: true, // Google already verified ownership of this email
        avatarUrl: g.picture,
      });
    } else if (!user.googleId) {
      // Existing email/password account signing in with Google for the first time — link it.
      user.googleId = g.googleId;
      user.emailVerified = true;
      if (!user.avatarUrl && g.picture) user.avatarUrl = g.picture;
      await user.save();
    }

    const token = signToken(user);
    res.json({ token, user: user.toPublicJSON() });
  } catch (err) {
    console.error('[auth/google]', err);
    res.status(401).json({ error: 'Google sign-in failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      const pending = await PendingSignup.findOne({ email: email.toLowerCase().trim() });
      if (pending) {
        return res.status(403).json({ error: 'Please verify your email before logging in.', pendingVerification: true });
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.passwordHash) {
      return res.status(401).json({ error: 'This account uses Google sign-in. Please continue with Google.' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ token, user: user.toPublicJSON() });
  } catch (err) {
    console.error('[auth/login]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', authRequired, async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
});

module.exports = router;
