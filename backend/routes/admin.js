const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const Report = require('../models/Report');
const Conversation = require('../models/Conversation');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// All admin routes require an authenticated admin.
router.use(authRequired, (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
});

// GET /api/admin/stats — platform overview numbers
router.get('/stats', async (req, res) => {
  try {
    const [users, posts, activePosts, openReports, convos] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Post.countDocuments({ isActive: true }),
      Report.countDocuments({ status: 'open' }),
      Conversation.countDocuments(),
    ]);
    res.json({ users, posts, activePosts, openReports, convos });
  } catch (err) {
    console.error('[admin/stats]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/reports — open reports with target + reporter populated
router.get('/reports', async (req, res) => {
  try {
    const reports = await Report.find({ status: 'open' })
      .sort({ createdAt: -1 })
      .populate('reporter', 'name')
      .limit(100)
      .lean();

    // Populate target names in memory
    const postIds = reports.filter((r) => r.targetType === 'post').map((r) => r.targetId);
    const userIds = reports.filter((r) => r.targetType === 'user').map((r) => r.targetId);
    const [posts, users] = await Promise.all([
      postIds.length ? Post.find({ _id: { $in: postIds } }).select('title segment isActive').lean() : [],
      userIds.length ? User.find({ _id: { $in: userIds } }).select('name isBanned').lean() : [],
    ]);
    const postMap = new Map(posts.map((p) => [String(p._id), p]));
    const userMap = new Map(users.map((u) => [String(u._id), u]));

    reports.forEach((r) => {
      r.target = r.targetType === 'post' ? postMap.get(String(r.targetId)) : userMap.get(String(r.targetId));
    });

    res.json({ reports });
  } catch (err) {
    console.error('[admin/reports]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/admin/reports/:id — resolve or dismiss a report
router.patch('/reports/:id', async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!['resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'status must be resolved or dismissed' });
    }
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ report });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/posts — all posts (including inactive), newest first
router.get('/posts', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'name isRuetVerified')
      .lean();
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/admin/posts/:id — hide/unhide (toggle isActive) a post
router.patch('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.isActive = req.body.isActive !== undefined ? Boolean(req.body.isActive) : !post.isActive;
    await post.save();
    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/users — all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: 1 })
      .select('name email isRuetVerified role isBanned createdAt')
      .lean();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/admin/users/:id/ban — ban or unban a user
router.patch('/users/:id/ban', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ error: 'Cannot ban an admin' });
    user.isBanned = req.body.ban !== undefined ? Boolean(req.body.ban) : !user.isBanned;
    await user.save();
    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
