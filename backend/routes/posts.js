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
      status,
      sort,
      minPrice,
      maxPrice,
      location,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { isActive: true };
    if (segment) filter.segment = segment;
    if (category) filter.category = category;
    if (postType) filter.postType = postType;
    if (author) filter.author = author;
    if (status) filter.status = status;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (ruetOnly === '1' || ruetOnly === 'true') {
      // Filter to posts whose author is RUET-verified.
      // Done via aggregate below.
    }
    if (q) filter.$text = { $search: q };

    const lim = Math.min(parseInt(limit, 10) || 20, 50);
    const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * lim;

    const sortMap = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      oldest: { createdAt: 1 },
      views: { views: -1 },
    };
    const sortOption = sortMap[sort] || { createdAt: -1 };

    let query = Post.find(filter)
      .sort(sortOption)
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

// GET /api/posts/saved — current user's saved posts
router.get('/saved', authRequired, async (req, res) => {
  try {
    const user = await req.user.populate({ path: 'savedPosts', populate: { path: 'author', select: 'name isRuetVerified department batch hall avatarUrl' } });
    const posts = (user.savedPosts || []).filter((p) => p && p.isActive);
    res.json({ posts });
  } catch (err) {
    console.error('[posts/saved]', err);
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

// POST /api/posts/:id/view — increment view counter
router.post('/:id/view', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true, select: 'views' }
    );
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ views: post.views });
  } catch (err) {
    res.status(400).json({ error: 'Invalid post id' });
  }
});

// POST /api/posts/:id/save — save (bookmark) a post
// DELETE /api/posts/:id/save — remove from saved
router.post('/:id/save', authRequired, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const idStr = String(post._id);
    if (!req.user.savedPosts.map(String).includes(idStr)) {
      req.user.savedPosts.push(post._id);
      await req.user.save();
    }
    res.json({ saved: true, count: req.user.savedPosts.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
router.delete('/:id/save', authRequired, async (req, res) => {
  try {
    req.user.savedPosts = req.user.savedPosts.filter(
      (p) => String(p) !== req.params.id
    );
    await req.user.save();
    res.json({ saved: false, count: req.user.savedPosts.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/posts/:id/status — owner updates listing status (available/reserved/sold)
router.patch('/:id/status', authRequired, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (String(post.author) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Not your post' });
    }
    const { status } = req.body || {};
    if (!['available', 'reserved', 'sold'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    post.status = status;
    await post.save();
    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
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
      negotiable,
      tags,
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
      negotiable: Boolean(negotiable),
      tags: Array.isArray(tags) ? tags.slice(0, 8) : [],
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
    'negotiable',
    'tags',
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
