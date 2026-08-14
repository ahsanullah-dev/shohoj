const express = require('express');
const multer = require('multer');
const { authRequired } = require('../middleware/auth');
const { isConfigured, uploadBuffer } = require('../config/cloudinary');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
});

// POST /api/uploads/images — up to 6 images at a time, field name "images"
router.post('/images', authRequired, upload.array('images', 6), async (req, res) => {
  if (!isConfigured()) {
    return res.status(500).json({
      error:
        'Image upload not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in backend .env.',
    });
  }
  const files = req.files || [];
  if (files.length === 0) return res.status(400).json({ error: 'No files uploaded' });

  try {
    const uploaded = await Promise.all(
      files.map((f) => uploadBuffer(f.buffer, 'shohoj/posts'))
    );
    res.json({ images: uploaded });
  } catch (err) {
    console.error('[uploads/images]', err);
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

// POST /api/uploads/avatar — single image, field name "avatar"
router.post('/avatar', authRequired, upload.single('avatar'), async (req, res) => {
  if (!isConfigured()) {
    return res.status(500).json({ error: 'Image upload not configured (Cloudinary env vars).' });
  }
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const img = await uploadBuffer(req.file.buffer, 'shohoj/avatars');
    res.json({ image: img });
  } catch (err) {
    console.error('[uploads/avatar]', err);
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

module.exports = router;
