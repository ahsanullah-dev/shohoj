const express = require('express');
const Notification = require('../models/Notification');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// ──────────────────────────────────────────────────
// GET /api/notifications
// Returns latest 30 notifications for the current user.
// Also returns unread count.
// ──────────────────────────────────────────────────
router.get('/', authRequired, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = notifications.filter((n) => !n.read).length;

    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error('[notifications/list]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ──────────────────────────────────────────────────
// PATCH /api/notifications/read-all
// Marks all notifications for the current user as read.
// ──────────────────────────────────────────────────
router.patch('/read-all', authRequired, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('[notifications/read-all]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ──────────────────────────────────────────────────
// PATCH /api/notifications/:id/read
// Marks a single notification as read.
// ──────────────────────────────────────────────────
router.patch('/:id/read', authRequired, async (req, res) => {
  try {
    const notif = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    });
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    notif.read = true;
    await notif.save();
    res.json({ ok: true, notification: notif });
  } catch (err) {
    console.error('[notifications/read-one]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
