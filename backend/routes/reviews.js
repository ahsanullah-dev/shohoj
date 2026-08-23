const express = require('express');
const Review = require('../models/Review');
const User = require('../models/User');
const { authRequired } = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

// GET /api/reviews/user/:id — list reviews for a user + aggregate rating
router.get('/user/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.id })
      .sort({ createdAt: -1 })
      .populate('reviewer', 'name isRuetVerified avatarUrl')
      .populate('post', 'title segment')
      .limit(100)
      .lean();

    const agg = await Review.aggregate([
      { $match: { reviewee: require('mongoose').Types.ObjectId(req.params.id) } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const rating = agg[0] || { avg: 0, count: 0 };

    res.json({
      reviews,
      rating: { avg: Math.round(rating.avg * 10) / 10, count: rating.count },
    });
  } catch (err) {
    console.error('[reviews/list]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/reviews — create/update a review for a user
router.post('/', authRequired, async (req, res) => {
  try {
    const { revieweeId, postId, rating, comment } = req.body || {};
    if (!revieweeId) return res.status(400).json({ error: 'revieweeId required' });
    if (String(revieweeId) === String(req.user._id)) {
      return res.status(400).json({ error: 'Cannot review yourself' });
    }
    const r = Number(rating);
    if (!r || r < 1 || r > 5) return res.status(400).json({ error: 'rating must be 1-5' });

    const target = await User.findById(revieweeId);
    if (!target) return res.status(404).json({ error: 'User not found' });

    // Upsert: one review per reviewer→reviewee
    const review = await Review.findOneAndUpdate(
      { reviewer: req.user._id, reviewee: revieweeId },
      {
        reviewer: req.user._id,
        reviewee: revieweeId,
        post: postId || null,
        rating: r,
        comment: String(comment || '').slice(0, 600),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('reviewer', 'name isRuetVerified avatarUrl');

    try {
      await Notification.create({
        recipient: revieweeId,
        type: 'new_review',
        title: `New ${r}★ review from ${req.user.name || 'someone'}`,
        body: String(comment || '').slice(0, 80),
        link: `profile.html?id=${revieweeId}`,
      });
    } catch (_) { /* non-critical */ }

    res.status(201).json({ review });
  } catch (err) {
    console.error('[reviews/create]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
