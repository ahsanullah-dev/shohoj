const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authRequired } = require('../middleware/auth');
const { generateSixDigitCode, sendVerificationEmail } = require('../utils/mailer');
const { verifyGoogleIdToken } = require('../utils/googleAuth');

const router = express.Router();

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_VERIFY_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute between resends

async function issueVerificationCode(user) {
  const code = generateSixDigitCode();
  user.emailVerificationCodeHash = await bcrypt.hash(code, 10);
  user.emailVerificationExpires = new Date(Date.now() + CODE_TTL_MS);
  user.emailVerificationAttempts = 0;
  await user.save();
  await sendVerificationEmail(user.email, user.name, code);
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
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      isRuetVerified: isRuetEmail(email),
    });

    await issueVerificationCode(user);

    const token = signToken(user);
    res.status(201).json({ token, user: user.toPublicJSON() });
  } catch (err) {
    console.error('[auth/register]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/verify-email  { email, code }
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body || {};
    if (!email || !code) return res.status(400).json({ error: 'email and code are required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: 'Account not found' });
    if (user.emailVerified) return res.json({ ok: true, alreadyVerified: true });

    if (!user.emailVerificationCodeHash || !user.emailVerificationExpires) {
      return res.status(400).json({ error: 'No verification code pending. Please request a new one.' });
    }
    if (user.emailVerificationExpires.getTime() < Date.now()) {
      return res.status(400).json({ error: 'Code expired. Please request a new one.' });
    }
    if (user.emailVerificationAttempts >= MAX_VERIFY_ATTEMPTS) {
      return res.status(429).json({ error: 'Too many attempts. Please request a new code.' });
    }

    const match = await bcrypt.compare(String(code).trim(), user.emailVerificationCodeHash);
    if (!match) {
      user.emailVerificationAttempts += 1;
      await user.save();
      return res.status(400).json({ error: 'Incorrect code' });
    }

    user.emailVerified = true;
    user.emailVerificationCodeHash = '';
    user.emailVerificationExpires = null;
    user.emailVerificationAttempts = 0;
    await user.save();

    res.json({ ok: true, user: user.toPublicJSON() });
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

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: 'Account not found' });
    if (user.emailVerified) return res.json({ ok: true, alreadyVerified: true });

    const lastSentAt = user.emailVerificationExpires
      ? user.emailVerificationExpires.getTime() - CODE_TTL_MS
      : 0;
    if (Date.now() - lastSentAt < RESEND_COOLDOWN_MS) {
      return res.status(429).json({ error: 'Please wait a moment before requesting another code.' });
    }

    await issueVerificationCode(user);
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
      user = await User.create({
        name: g.name,
        email,
        passwordHash: '', // Google-only account, no password login
        googleId: g.googleId,
        isRuetVerified: isRuetEmail(email),
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
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
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
