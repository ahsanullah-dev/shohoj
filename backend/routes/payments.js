const express = require('express');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Payment = require('../models/Payment');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// GET /api/payments/config — public info a client needs to render the "Send Money" screen
router.get('/config', (req, res) => {
  res.json({
    bkashNumber: process.env.PAYMENT_BKASH_NUMBER || '',
    nagadNumber: process.env.PAYMENT_NAGAD_NUMBER || '',
    instructions:
      process.env.PAYMENT_INSTRUCTIONS ||
      'Open your bKash/Nagad app, tap Send Money, send the amount to the number above, then submit the Transaction ID here.',
    methods: ['bkash', 'nagad'],
    disclaimer:
      'This is a manual peer-to-peer Send Money flow. Real bKash/Nagad merchant APIs require business registration and will be integrated in a future release.',
  });
});

// POST /api/payments — seller creates a payment request inside a conversation
// body: { conversationId, amount, method: 'bkash'|'nagad', note? }
router.post('/', authRequired, async (req, res) => {
  try {
    const { conversationId, amount, method, note } = req.body || {};
    if (!conversationId || !amount || !method) {
      return res.status(400).json({ error: 'conversationId, amount, method are required' });
    }
    if (!['bkash', 'nagad'].includes(method)) {
      return res.status(400).json({ error: 'method must be bkash or nagad' });
    }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt < 1) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }

    const convo = await Conversation.findById(conversationId);
    if (!convo) return res.status(404).json({ error: 'Conversation not found' });
    if (!convo.participants.some((p) => String(p) === String(req.user._id))) {
      return res.status(403).json({ error: 'Not a participant' });
    }
    const buyerId = convo.participants.find((p) => String(p) !== String(req.user._id));
    if (!buyerId) return res.status(400).json({ error: 'Conversation has no other participant' });

    const receiverNumber =
      method === 'bkash'
        ? req.user.bkashNumber || process.env.PAYMENT_BKASH_NUMBER || ''
        : req.user.nagadNumber || process.env.PAYMENT_NAGAD_NUMBER || '';

    if (!receiverNumber) {
      return res.status(400).json({
        error:
          'No receiver number configured. Add your bKash/Nagad number in your profile or in server .env.',
      });
    }

    const payment = await Payment.create({
      conversation: convo._id,
      post: convo.post || null,
      seller: req.user._id,
      buyer: buyerId,
      amount: amt,
      method,
      receiverNumber,
      note: note || '',
      status: 'requested',
    });

    const message = await Message.create({
      conversation: convo._id,
      sender: req.user._id,
      type: 'payment',
      text: `Payment request: BDT ${amt} via ${method.toUpperCase()}`,
      payment: payment._id,
    });
    convo.lastMessageAt = new Date();
    convo.lastMessagePreview = `[Payment request] BDT ${amt}`;
    await convo.save();

    const populatedMsg = await message.populate('payment');
    res.status(201).json({ payment, message: populatedMsg });
  } catch (err) {
    console.error('[payments/create]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/payments/:id/submit — buyer submits Transaction ID after sending money
// body: { transactionId }
router.post('/:id/submit', authRequired, async (req, res) => {
  const { transactionId } = req.body || {};
  if (!transactionId || !String(transactionId).trim()) {
    return res.status(400).json({ error: 'transactionId required' });
  }
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  if (String(payment.buyer) !== String(req.user._id)) {
    return res.status(403).json({ error: 'Only the buyer can submit a transaction ID' });
  }
  if (payment.status !== 'requested') {
    return res.status(400).json({ error: `Cannot submit while status is ${payment.status}` });
  }
  payment.transactionId = String(transactionId).trim();
  payment.submittedAt = new Date();
  payment.status = 'submitted';
  await payment.save();

  await Message.create({
    conversation: payment.conversation,
    sender: req.user._id,
    type: 'text',
    text: `Sent BDT ${payment.amount} via ${payment.method.toUpperCase()}. TrxID: ${payment.transactionId}`,
  });

  res.json({ payment });
});

// POST /api/payments/:id/confirm — seller confirms receipt
router.post('/:id/confirm', authRequired, async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  if (String(payment.seller) !== String(req.user._id)) {
    return res.status(403).json({ error: 'Only the seller can confirm receipt' });
  }
  if (payment.status !== 'submitted') {
    return res.status(400).json({ error: `Cannot confirm while status is ${payment.status}` });
  }
  payment.status = 'paid';
  payment.confirmedAt = new Date();
  await payment.save();

  await Message.create({
    conversation: payment.conversation,
    sender: req.user._id,
    type: 'text',
    text: `Payment confirmed: BDT ${payment.amount} received.`,
  });
  res.json({ payment });
});

// POST /api/payments/:id/cancel — either party cancels if not yet paid
router.post('/:id/cancel', authRequired, async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  const isParty =
    String(payment.buyer) === String(req.user._id) ||
    String(payment.seller) === String(req.user._id);
  if (!isParty) return res.status(403).json({ error: 'Not a party to this payment' });
  if (payment.status === 'paid') {
    return res.status(400).json({ error: 'Already paid; cannot cancel' });
  }
  payment.status = 'cancelled';
  await payment.save();
  await Message.create({
    conversation: payment.conversation,
    sender: req.user._id,
    type: 'text',
    text: 'Payment request cancelled.',
  });
  res.json({ payment });
});

// POST /api/payments/:id/dispute
router.post('/:id/dispute', authRequired, async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  const isParty =
    String(payment.buyer) === String(req.user._id) ||
    String(payment.seller) === String(req.user._id);
  if (!isParty) return res.status(403).json({ error: 'Not a party to this payment' });
  payment.status = 'disputed';
  await payment.save();
  await Message.create({
    conversation: payment.conversation,
    sender: req.user._id,
    type: 'text',
    text: 'Payment marked as disputed. Please resolve via chat.',
  });
  res.json({ payment });
});

// GET /api/payments/mine — payments where I am buyer or seller
router.get('/mine', authRequired, async (req, res) => {
  const payments = await Payment.find({
    $or: [{ buyer: req.user._id }, { seller: req.user._id }],
  })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('seller', 'name')
    .populate('buyer', 'name')
    .populate('post', 'title segment');
  res.json({ payments });
});

module.exports = router;
