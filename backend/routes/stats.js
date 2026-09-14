const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const { SEGMENTS } = require('../models/Post');

const router = express.Router();

// GET /api/stats — public, no auth required.
// Only returns numbers we can actually back up from the database.
// (No "avg match time", "rating", or "৳ settled" — those would need
// features that don't exist yet: a status field, a rating system, and
// settlement tracking on Post/Payment.)
router.get('/', async (req, res) => {
  try {
    const [totalUsers, verifiedUsers, totalPosts] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isRuetVerified: true }),
      Post.countDocuments({ isActive: true }),
    ]);

    res.json({
      totalUsers,
      verifiedUsers,
      totalPosts,
      segments: SEGMENTS.length,
    });
  } catch (err) {
    console.error('[stats]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
