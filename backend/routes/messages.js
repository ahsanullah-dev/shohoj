const express = require('express');
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Post = require('../models/Post');
const { authRequired } = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

const USER_FIELDS =
  'name isRuetVerified universityTag universityName universityVerified avatarUrl';

// In-memory typing tracker: key `${convoId}:${userId}` -> timestamp (ms)
const typingMap = new Map();

// Periodic cleanup of typing records older than 30s
setInterval(() => {
  const now = Date.now();
  for (const [key, ts] of typingMap.entries()) {
    if (now - ts > 30000) typingMap.delete(key);
  }
}, 60000);

// GET /api/messages/conversations — list my conversations
router.get('/conversations', authRequired, async (req, res) => {
  try {
    const convos = await Conversation.find({ participants: req.user._id })
      .sort({ lastMessageAt: -1 })
      .limit(100)
      .populate('participants', USER_FIELDS)
      .populate('post', 'title segment');
    res.json({ conversations: convos });
  } catch (err) {
    console.error('[messages/conversations]', err);
    res.status(500).json({ error: 'Server error' });
  }
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
      { path: 'participants', select: USER_FIELDS },
      { path: 'post', select: 'title segment' },
    ]);
    res.json({ conversation: populated });
  } catch (err) {
    console.error('[messages/conversations/create]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/messages/:conversationId — list messages
// Optional query: since=<ISO date> for lightweight polling
router.get('/:conversationId', authRequired, async (req, res) => {
  try {
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
      .populate('sender', USER_FIELDS)
      .populate('payment');

    // Automatically mark unread incoming messages as read
    await Message.updateMany(
      { conversation: convo._id, sender: { $ne: req.user._id }, readAt: null },
      { $set: { readAt: new Date() } }
    );

    // Check if other participant is currently typing (within last 3.5 seconds)
    const now = Date.now();
    const otherParticipant = convo.participants.find(
      (p) => String(p) !== String(req.user._id)
    );
    let isTyping = false;
    if (otherParticipant) {
      const key = `${convo._id}:${otherParticipant}`;
      const lastTyped = typingMap.get(key);
      if (lastTyped && now - lastTyped < 3500) {
        isTyping = true;
      }
    }

    res.json({ messages, isTyping });
  } catch (err) {
    console.error('[messages/list]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/messages/:conversationId/typing — announce user is typing
router.post('/:conversationId/typing', authRequired, async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.conversationId);
    if (!convo) return res.status(404).json({ error: 'Conversation not found' });
    if (!convo.participants.some((p) => String(p) === String(req.user._id))) {
      return res.status(403).json({ error: 'Not a participant' });
    }

    const key = `${convo._id}:${req.user._id}`;
    typingMap.set(key, Date.now());
    res.json({ ok: true });
  } catch (err) {
    console.error('[messages/typing]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/messages/:conversationId/read — mark all messages in thread as read
router.patch('/:conversationId/read', authRequired, async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.conversationId);
    if (!convo) return res.status(404).json({ error: 'Conversation not found' });
    if (!convo.participants.some((p) => String(p) === String(req.user._id))) {
      return res.status(403).json({ error: 'Not a participant' });
    }

    await Message.updateMany(
      { conversation: convo._id, sender: { $ne: req.user._id }, readAt: null },
      { $set: { readAt: new Date() } }
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('[messages/read]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/messages/:conversationId — send a message (text and/or image)
router.post('/:conversationId', authRequired, async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.conversationId);
    if (!convo) return res.status(404).json({ error: 'Conversation not found' });
    if (!convo.participants.some((p) => String(p) === String(req.user._id))) {
      return res.status(403).json({ error: 'Not a participant' });
    }
    const { text = '', imageUrl = '', imagePublicId = '' } = req.body || {};
    const cleanText = String(text).trim();
    if (!cleanText && !imageUrl) {
      return res.status(400).json({ error: 'Message text or image required' });
    }

    const msgType = imageUrl ? (cleanText ? 'text' : 'image') : 'text';
    const msg = await Message.create({
      conversation: convo._id,
      sender: req.user._id,
      type: msgType,
      text: cleanText,
      imageUrl: imageUrl || '',
      imagePublicId: imagePublicId || '',
    });

    const populatedMsg = await msg.populate('sender', USER_FIELDS);

    const preview = cleanText ? cleanText.slice(0, 100) : '📷 Photo';
    convo.lastMessageAt = new Date();
    convo.lastMessagePreview = preview;
    await convo.save();

    // Clear typing flag for current sender
    typingMap.delete(`${convo._id}:${req.user._id}`);

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
          body: preview.slice(0, 80),
          link: `inbox.html?c=${convo._id}`,
        });
      }
    } catch (_) { /* non-critical */ }

    res.status(201).json({ message: populatedMsg });
  } catch (err) {
    console.error('[messages/send]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
