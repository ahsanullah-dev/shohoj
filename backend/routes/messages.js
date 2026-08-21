const express = require('express');
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Post = require('../models/Post');
const { authRequired } = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

// GET /api/messages/conversations — list my conversations
router.get('/conversations', authRequired, async (req, res) => {
  const convos = await Conversation.find({ participants: req.user._id })
    .sort({ lastMessageAt: -1 })
    .limit(100)
    .populate('participants', 'name isRuetVerified avatarUrl')
    .populate('post', 'title segment');
  res.json({ conversations: convos });
});

// POST /api/messages/conversations — start (or fetch existing) conversation with someone
// body: { recipientId, postId? }
router.post('/conversations', authRequired, async (req, res) => {
  try {
    const { recipientId, postId = null } = req.body || {};
    if (!recipientId) return res.status(400).json({ error: 'recipientId required' });
    if (String(recipientId) === String(req.user._id)) {
      return res.status(400).json({ error: 'Cannot message yourself' });
    }

    const participants = [req.user._id, new mongoose.Types.ObjectId(recipientId)];
    let convo = await Conversation.findOne({
      participants: { $all: participants, $size: 2 },
      post: postId,
    });
    if (!convo) {
      convo = await Conversation.create({ participants, post: postId });
    }
    const populated = await convo.populate([
      { path: 'participants', select: 'name isRuetVerified avatarUrl' },
      { path: 'post', select: 'title segment' },
    ]);
    res.json({ conversation: populated });
  } catch (err) {
    console.error('[messages/conversations]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/messages/:conversationId — list messages
// Optional query: since=<ISO date> for lightweight polling
router.get('/:conversationId', authRequired, async (req, res) => {
  const convo = await Conversation.findById(req.params.conversationId);
  if (!convo) return res.status(404).json({ error: 'Conversation not found' });
  if (!convo.participants.some((p) => String(p) === String(req.user._id))) {
    return res.status(403).json({ error: 'Not a participant' });
  }

  const filter = { conversation: convo._id };
  if (req.query.since) {
    const since = new Date(req.query.since);
    if (!Number.isNaN(since.getTime())) filter.createdAt = { $gt: since };
  }

  const messages = await Message.find(filter)
    .sort({ createdAt: 1 })
    .limit(500)
    .populate('payment');
  res.json({ messages });
});

// POST /api/messages/:conversationId — send a text message
router.post('/:conversationId', authRequired, async (req, res) => {
  const convo = await Conversation.findById(req.params.conversationId);
  if (!convo) return res.status(404).json({ error: 'Conversation not found' });
  if (!convo.participants.some((p) => String(p) === String(req.user._id))) {
    return res.status(403).json({ error: 'Not a participant' });
  }
  const { text } = req.body || {};
  if (!text || !String(text).trim()) return res.status(400).json({ error: 'Text required' });

  const msg = await Message.create({
    conversation: convo._id,
    sender: req.user._id,
    type: 'text',
    text: String(text).trim(),
  });
  convo.lastMessageAt = new Date();
  convo.lastMessagePreview = String(text).trim().slice(0, 100);
  await convo.save();

  // Notify the other participant
  try {
    const recipientId = convo.participants.find(
      (p) => String(p) !== String(req.user._id)
    );
    if (recipientId) {
      await Notification.create({
        recipient: recipientId,
        type: 'new_message',
        title: `New message from ${req.user.name || 'someone'}`,
        body: String(text).trim().slice(0, 80),
        link: `inbox.html`,
      });
    }
  } catch (_) { /* non-critical */ }

  res.status(201).json({ message: msg });
});

module.exports = router;
