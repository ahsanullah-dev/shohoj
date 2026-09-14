const express = require('express');
const Report = require('../models/Report');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// POST /api/reports
// Submit a report for a post or a user
router.post('/', authRequired, async (req, res) => {
  try {
    const { targetType, targetId, reason, details } = req.body || {};

    if (!targetType || !['user', 'post'].includes(targetType)) {
      return res.status(400).json({ error: 'Valid targetType ("user" or "post") is required' });
    }
    if (!targetId) {
      return res.status(400).json({ error: 'targetId is required' });
    }
    if (!reason) {
      return res.status(400).json({ error: 'reason is required' });
    }

    // Rate limiting: max 5 reports in the last hour per user
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentReports = await Report.countDocuments({
      reporter: req.user._id,
      createdAt: { $gt: oneHourAgo },
    });

    if (recentReports >= 5) {
      return res.status(429).json({
        error: 'You have submitted too many reports recently. Please try again later.',
      });
    }

    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      targetId,
      reason,
      details: details ? String(details).trim().slice(0, 1000) : '',
    });

    res.status(201).json({
      ok: true,
      message: 'Thank you. The report has been received and will be reviewed.',
      reportId: report._id,
    });
  } catch (err) {
    console.error('[reports/create]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
