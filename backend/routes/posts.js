const express = require('express');
const Post = require('../models/Post');
const { SEGMENTS } = require('../models/Post');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const Favorite = require('../models/Favorite');
const { authRequired, authOptional } = require('../middleware/auth');
const { destroy } = require('../config/cloudinary');
const Notification = require('../models/Notification');

const router = express.Router();

const AUTHOR_POPULATE_FIELDS =
  'name isRuetVerified universityTag universityName universityVerified department batch hall avatarUrl';

// GET /api/posts/favorites/mine — list current user's saved/favorited posts
router.get('/favorites/mine', authRequired, async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);

    const postIds = favorites.map((f) => f.post);
    const posts = await Post.find({ _id: { $in: postIds }, isActive: true })
      .populate('author', AUTHOR_POPULATE_FIELDS);

    // Map into favorites ordering and flag as favorited
    const postMap = new Map(posts.map((p) => [String(p._id), p]));
    const orderedPosts = favorites
      .map((f) => postMap.get(String(f.post)))
      .filter(Boolean)
      .map((p) => {
        const obj = p.toObject ? p.toObject() : { ...p };
        obj.favorited = true;
        return obj;
      });

    res.json({ posts: orderedPosts });
  } catch (err) {
    console.error('[posts/favorites/mine]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/posts — list posts with filters
// Query: segment, category, postType, q, ruetOnly=1, university, minPrice, maxPrice, page, limit, author
router.get('/', authOptional, async (req, res) => {
  try {
    const {
      segment,
      category,
      postType,
      q,
      ruetOnly,
      university,
      minPrice,
      maxPrice,
      author,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { isActive: true };
    if (segment) filter.segment = segment;
    if (category) filter.category = category;
    if (postType) filter.postType = postType;
    if (author) filter.author = author;

    // Price filtering
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        filter.price.$lte = Number(maxPrice);
      }
    }

    if (q) filter.$text = { $search: q };

    const lim = Math.min(parseInt(limit, 10) || 20, 50);
    const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * lim;

    let posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim)
      .populate('author', AUTHOR_POPULATE_FIELDS);

    // Filter by RUET-only if requested
    if (ruetOnly === '1' || ruetOnly === 'true') {
      posts = posts.filter((p) => p.author && (p.author.isRuetVerified || p.author.universityTag === 'RUET'));
    }

    // Filter by specific university if specified (e.g., 'RUET', 'BUET', 'VU')
    if (university && university.trim() && university !== 'all') {
      const uTag = university.trim().toUpperCase();
      posts = posts.filter((p) => {
        if (!p.author) return false;
        if (uTag === 'RUET') {
          return p.author.isRuetVerified || (p.author.universityTag && p.author.universityTag.toUpperCase() === 'RUET');
        }
        return p.author.universityTag && p.author.universityTag.toUpperCase() === uTag;
      });
    }

    // If authenticated user, annotate with liked and favorited status
    if (req.user && posts.length > 0) {
      const postIds = posts.map((p) => p._id);
      const [userLikes, userFavs] = await Promise.all([
        Like.find({ user: req.user._id, post: { $in: postIds } }).select('post'),
        Favorite.find({ user: req.user._id, post: { $in: postIds } }).select('post'),
      ]);

      const likedSet = new Set(userLikes.map((l) => String(l.post)));
      const favSet = new Set(userFavs.map((f) => String(f.post)));

      posts = posts.map((p) => {
        const obj = p.toObject ? p.toObject() : { ...p };
        obj.liked = likedSet.has(String(p._id));
        obj.favorited = favSet.has(String(p._id));
        return obj;
      });
    }

    res.json({ posts, page: Number(page), limit: lim });
  } catch (err) {
    console.error('[posts/list]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/posts/:id
router.get('/:id', authOptional, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'author',
      `${AUTHOR_POPULATE_FIELDS} bio`
    );
    if (!post) return res.status(404).json({ error: 'Post not found' });

    let postObj = post.toObject ? post.toObject() : { ...post };

    // Check liked & favorited state for logged in user
    if (req.user) {
      const [hasLiked, hasFav] = await Promise.all([
        Like.exists({ user: req.user._id, post: post._id }),
        Favorite.exists({ user: req.user._id, post: post._id }),
      ]);
      postObj.liked = Boolean(hasLiked);
      postObj.favorited = Boolean(hasFav);
    }

    res.json({ post: postObj });
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
      landmark,
      coordinates,
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
      images: Array.isArray(images)
        ? images
            .map((i) => (typeof i === 'string' ? { url: i, publicId: '' } : i))
            .filter((i) => i && i.url)
        : [],
      landmark: landmark || '',
      coordinates: coordinates && typeof coordinates === 'object' ? {
        lat: coordinates.lat != null ? Number(coordinates.lat) : null,
        lng: coordinates.lng != null ? Number(coordinates.lng) : null,
      } : { lat: null, lng: null },
      isRuetOnly: Boolean(isRuetOnly),
    });

    const populated = await post.populate(
      'author',
      AUTHOR_POPULATE_FIELDS
    );

    // Push a notification to the author confirming their post is live
    try {
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
    'landmark',
    'coordinates',
    'isRuetOnly',
    'isActive',
  ];
  for (const key of editable) {
    if (key in req.body) post[key] = req.body[key];
  }
  await post.save();
  res.json({ post });
});

// DELETE /api/posts/:id — delete own (also removes cloudinary images and related likes/comments/favorites)
router.delete('/:id', authRequired, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (String(post.author) !== String(req.user._id)) {
    return res.status(403).json({ error: 'Not your post' });
  }
  // Best-effort cleanup of cloudinary images
  await Promise.all((post.images || []).map((img) => destroy(img.publicId)));
  await Promise.all([
    post.deleteOne(),
    Like.deleteMany({ post: post._id }),
    Comment.deleteMany({ post: post._id }),
    Favorite.deleteMany({ post: post._id }),
  ]);
  res.json({ ok: true });
});

// --- LIKES ---

// POST /api/posts/:id/like — like a post
router.post('/:id/like', authRequired, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const existing = await Like.findOne({ post: post._id, user: req.user._id });
    if (!existing) {
      await Like.create({ post: post._id, user: req.user._id });
      post.likeCount = (post.likeCount || 0) + 1;
      await post.save();
    }

    res.json({ ok: true, liked: true, likeCount: post.likeCount });
  } catch (err) {
    console.error('[posts/like]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/posts/:id/like — unlike a post
router.delete('/:id/like', authRequired, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const existing = await Like.findOneAndDelete({ post: post._id, user: req.user._id });
    if (existing && (post.likeCount || 0) > 0) {
      post.likeCount -= 1;
      await post.save();
    }

    res.json({ ok: true, liked: false, likeCount: post.likeCount });
  } catch (err) {
    console.error('[posts/unlike]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- FAVORITES / SAVED ---

// POST /api/posts/:id/favorite — save/bookmark a post
router.post('/:id/favorite', authRequired, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    await Favorite.findOneAndUpdate(
      { post: post._id, user: req.user._id },
      { post: post._id, user: req.user._id },
      { upsert: true }
    );

    res.json({ ok: true, favorited: true });
  } catch (err) {
    console.error('[posts/favorite]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/posts/:id/favorite — remove save/bookmark
router.delete('/:id/favorite', authRequired, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    await Favorite.findOneAndDelete({ post: post._id, user: req.user._id });
    res.json({ ok: true, favorited: false });
  } catch (err) {
    console.error('[posts/unfavorite]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- COMMENTS ---

// GET /api/posts/:id/comments — list comments
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .sort({ createdAt: 1 })
      .populate('user', AUTHOR_POPULATE_FIELDS);

    res.json({ comments });
  } catch (err) {
    console.error('[posts/comments/list]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/posts/:id/comments — add a comment
router.post('/:id/comments', authRequired, async (req, res) => {
  try {
    const { text } = req.body || {};
    const cleanText = String(text || '').trim();
    if (!cleanText) {
      return res.status(400).json({ error: 'Comment text cannot be empty' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = await Comment.create({
      post: post._id,
      user: req.user._id,
      text: cleanText.slice(0, 1000),
    });

    post.commentCount = (post.commentCount || 0) + 1;
    await post.save();

    const populated = await comment.populate('user', AUTHOR_POPULATE_FIELDS);

    // Notify post author if not the commenter
    if (String(post.author) !== String(req.user._id)) {
      try {
        await Notification.create({
          recipient: post.author,
          type: 'new_comment',
          title: `${req.user.name || 'Someone'} commented on your post`,
          body: cleanText.slice(0, 80),
          link: `post.html?id=${post._id}`,
        });
      } catch (_) { /* non-critical */ }
    }

    res.status(201).json({ comment: populated, commentCount: post.commentCount });
  } catch (err) {
    console.error('[posts/comments/create]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/posts/:id/comments/:commentId — delete comment
router.delete('/:id/comments/:commentId', authRequired, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const post = await Post.findById(req.params.id);
    // Allow comment author OR post author to delete the comment
    const isCommentAuthor = String(comment.user) === String(req.user._id);
    const isPostAuthor = post && String(post.author) === String(req.user._id);

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();

    if (post && (post.commentCount || 0) > 0) {
      post.commentCount -= 1;
      await post.save();
    }

    res.json({ ok: true, commentCount: post ? post.commentCount : 0 });
  } catch (err) {
    console.error('[posts/comments/delete]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
