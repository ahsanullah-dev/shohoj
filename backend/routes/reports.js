const express = require('express');
const Report = require('../models/Report');
const { authRequired } = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

// POST /api/reports — flag a post or user
router.post('/', authRequired, async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body || {};
    if (!targetType || !['post', 'user'].includes(targetType)) {
      return res.status(400).json({ error: 'targetType must be post or user' });
    }
    if (!targetId) return res.status(400).json({ error: 'targetId required' });

    // De-duplicate: one open report per reporter+target
    const existing = await Report.findOne({
      reporter: req.user._id,
      targetType,
      targetId,
      status: 'open',
    });
    if (existing) return res.status(409).json({ error: 'You already reported this' });

    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      targetId,
      reason: String(reason || '').slice(0, 500),
    });
    await report.populate('reporter', 'name');

    // Notify admins
    try {
      const User = require('../models/User');
      const admins = await User.find({ role: 'admin' }).select('_id');
      await Promise.all(
        admins.map((a) =>
          Notification.create({
            recipient: a._id,
            type: 'reported',
            title: `New ${targetType} report`,
            body: String(reason || '').slice(0, 80) || 'No reason given',
            link: 'admin.html',
          })
        )
      );
    } catch (_) { /* non-critical */ }

    res.status(201).json({ report });
  } catch (err) {
    console.error('[reports/create]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
