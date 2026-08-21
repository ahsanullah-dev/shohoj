const express = require('express');
const Post = require('../models/Post');
const { SEGMENTS } = require('../models/Post');
const { authRequired, authOptional } = require('../middleware/auth');
const { destroy } = require('../config/cloudinary');
const Notification = require('../models/Notification');

const router = express.Router();

// GET /api/posts — list posts with filters
// Query: segment, category, postType, q, ruetOnly=1, page, limit, author
router.get('/', authOptional, async (req, res) => {
  try {
    const {
      segment,
      category,
      postType,
      q,
      ruetOnly,
      author,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { isActive: true };
    if (segment) filter.segment = segment;
    if (category) filter.category = category;
    if (postType) filter.postType = postType;
    if (author) filter.author = author;
    if (ruetOnly === '1' || ruetOnly === 'true') {
      // Filter to posts whose author is RUET-verified.
      // Done via aggregate below.
    }
    if (q) filter.$text = { $search: q };

    const lim = Math.min(parseInt(limit, 10) || 20, 50);
    const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * lim;

    let query = Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim)
      .populate('author', 'name isRuetVerified department batch hall avatarUrl');

    let posts = await query;

    if (ruetOnly === '1' || ruetOnly === 'true') {
      posts = posts.filter((p) => p.author && p.author.isRuetVerified);
    }

    res.json({ posts, page: Number(page), limit: lim });
  } catch (err) {
    console.error('[posts/list]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/posts/:id
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'author',
      'name isRuetVerified department batch hall avatarUrl bio'
    );
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post });
  } catch (err) {
    res.status(400).json({ error: 'Invalid post id' });
  }
});

// POST /api/posts — create
router.post('/', authRequired, async (req, res) => {
  try {
    const {
      segment,
      category,
      postType,
      title,
      description,
      price,
      priceNote,
      condition,
      location,
      urgency,
      deliveryTime,
      courseCode,
      mode,
      images,
      isRuetOnly,
    } = req.body || {};

    if (!segment || !SEGMENTS.includes(segment)) {
      return res.status(400).json({ error: 'Valid segment is required' });
    }
    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const post = await Post.create({
      author: req.user._id,
      segment,
      category: category || '',
      postType: postType || 'offer',
      title: String(title).trim(),
      description: description || '',
      price: price === '' || price == null ? null : Number(price),
      priceNote: priceNote || '',
      condition: condition || '',
      location: location || '',
      urgency: urgency || '',
      deliveryTime: deliveryTime || '',
      courseCode: courseCode || '',
      mode: mode || '',
      images: Array.isArray(images) ? images.filter((i) => i && i.url) : [],
      isRuetOnly: Boolean(isRuetOnly),
    });

    const populated = await post.populate(
      'author',
      'name isRuetVerified department batch hall avatarUrl'
    );

    // Push a notification to the author confirming their post is live
    try {
      const segLabel = SEGMENTS.includes(segment) ? segment : segment;
      await Notification.create({
        recipient: req.user._id,
        type: 'new_post',
        title: 'Your post is live 🎉',
        body: String(title).trim(),
        link: `post.html?id=${post._id}`,
      });
    } catch (_) { /* non-critical */ }

    res.status(201).json({ post: populated });
  } catch (err) {
    console.error('[posts/create]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/posts/:id — edit own
router.patch('/:id', authRequired, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (String(post.author) !== String(req.user._id)) {
    return res.status(403).json({ error: 'Not your post' });
  }
  const editable = [
    'title',
    'description',
    'category',
    'postType',
    'price',
    'priceNote',
    'condition',
    'location',
    'urgency',
    'deliveryTime',
    'courseCode',
    'mode',
    'images',
    'isRuetOnly',
    'isActive',
  ];
  for (const key of editable) {
    if (key in req.body) post[key] = req.body[key];
  }
  await post.save();
  res.json({ post });
});

// DELETE /api/posts/:id — delete own (also removes cloudinary images)
router.delete('/:id', authRequired, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (String(post.author) !== String(req.user._id)) {
    return res.status(403).json({ error: 'Not your post' });
  }
  // Best-effort cleanup of cloudinary images
  await Promise.all((post.images || []).map((img) => destroy(img.publicId)));
  await post.deleteOne();
  res.json({ ok: true });
});

module.exports = router;
