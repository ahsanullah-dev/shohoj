const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Review = require('../models/Review');
const Conversation = require('../models/Conversation');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/me/stats — dashboard numbers for the current user
router.get('/me/stats', authRequired, async (req, res) => {
  try {
    const uid = req.user._id;
    const [posts, savedCount, convos, reviewAgg] = await Promise.all([
      Post.countDocuments({ author: uid, isActive: true }),
      (req.user.savedPosts || []).length,
      Conversation.countDocuments({ participants: uid }),
      Review.aggregate([
        { $match: { reviewee: uid } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]),
    ]);
    const rating = reviewAgg[0] || { avg: 0, count: 0 };
    res.json({
      posts,
      saved: savedCount,
      conversations: convos,
      rating: { avg: Math.round(rating.avg * 10) / 10, count: rating.count },
    });
  } catch (err) {
    console.error('[users/stats]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/users/me/block/:id — block (or unblock) a user
router.post('/me/block/:id', authRequired, async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ error: 'Cannot block yourself' });
    }
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found' });
    const idStr = String(target._id);
    const blocked = req.user.blockedUsers.map(String);
    if (blocked.includes(idStr)) {
      req.user.blockedUsers = req.user.blockedUsers.filter((p) => String(p) !== idStr);
      await req.user.save();
      return res.json({ blocked: false });
    }
    req.user.blockedUsers.push(target._id);
    await req.user.save();
    res.json({ blocked: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/:id — public profile + their active posts + rating
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const [posts, reviewAgg] = await Promise.all([
      Post.find({ author: user._id, isActive: true })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Review.aggregate([
        { $match: { reviewee: user._id } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]),
    ]);
    const rating = reviewAgg[0] || { avg: 0, count: 0 };
    res.json({
      user: user.toPublicJSON(),
      posts,
      rating: { avg: Math.round(rating.avg * 10) / 10, count: rating.count },
    });
  } catch (err) {
    res.status(400).json({ error: 'Invalid user id' });
  }
});

// PATCH /api/users/me — update own profile
router.patch('/me', authRequired, async (req, res) => {
  const allowed = [
    'name',
    'department',
    'batch',
    'hall',
    'bio',
    'avatarUrl',
    'avatarPublicId',
    'bkashNumber',
    'nagadNumber',
  ];
  for (const key of allowed) {
    if (key in req.body) req.user[key] = req.body[key];
  }
  await req.user.save();
  res.json({ user: req.user.toPublicJSON() });
});

module.exports = router;
