const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authRequired } = require('../middleware/auth');
const { isConfigured, uploadBuffer } = require('../config/cloudinary');

const router = express.Router();

// Ensure local uploads directory exists
const UPLOADS_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
});

/**
 * Save file locally as fallback
 */
async function saveLocally(file, prefix = 'img') {
  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const cleanExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg';
  const filename = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${cleanExt}`;
  const targetPath = path.join(UPLOADS_DIR, filename);
  await fs.promises.writeFile(targetPath, file.buffer);
  return {
    url: `/uploads/${filename}`,
    publicId: filename,
    width: 800,
    height: 600,
    isLocal: true,
  };
}

// POST /api/uploads/images — up to 6 images at a time, field name "images"
router.post('/images', authRequired, upload.array('images', 6), async (req, res) => {
  const files = req.files || [];
  if (files.length === 0) return res.status(400).json({ error: 'No files uploaded' });

  try {
    if (isConfigured()) {
      try {
        const uploaded = await Promise.all(
          files.map((f) => uploadBuffer(f.buffer, 'shohoj/posts'))
        );
        return res.json({ images: uploaded });
      } catch (cloudErr) {
        console.warn('[uploads/images] Cloudinary upload failed, falling back to local:', cloudErr.message);
      }
    }

    // Fallback: save to local disk
    const localUploaded = await Promise.all(
      files.map((f) => saveLocally(f, 'post'))
    );
    res.json({ images: localUploaded });
  } catch (err) {
    console.error('[uploads/images]', err);
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

// POST /api/uploads/avatar — single image, field name "avatar"
router.post('/avatar', authRequired, upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    if (isConfigured()) {
      try {
        const img = await uploadBuffer(req.file.buffer, 'shohoj/avatars');
        return res.json({ image: img });
      } catch (cloudErr) {
        console.warn('[uploads/avatar] Cloudinary upload failed, falling back to local:', cloudErr.message);
      }
    }

    // Fallback: save to local disk
    const img = await saveLocally(req.file, 'avatar');
    res.json({ image: img });
  } catch (err) {
    console.error('[uploads/avatar]', err);
    res.status(500).json({ error: 'Upload failed: ' + err.message });
// POST /api/uploads/chat — single image attachment, field name "image"
router.post('/chat', authRequired, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    if (isConfigured()) {
      try {
        const img = await uploadBuffer(req.file.buffer, 'shohoj/chat');
        return res.json({ image: img });
      } catch (cloudErr) {
        console.warn('[uploads/chat] Cloudinary upload failed, falling back to local:', cloudErr.message);
      }
    }

    // Fallback: save to local disk
    const img = await saveLocally(req.file, 'chat');
    res.json({ image: img });
  } catch (err) {
    console.error('[uploads/chat]', err);
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

module.exports = router;

