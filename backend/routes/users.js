const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/:id — public profile + their active posts
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const posts = await Post.find({ author: user._id, isActive: true })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ user: user.toPublicJSON(), posts });
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
