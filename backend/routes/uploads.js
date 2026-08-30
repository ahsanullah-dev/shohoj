const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authRequired } = require('../middleware/auth');
const { isConfigured, uploadBuffer } = require('../config/cloudinary');

const router = express.Router();

// Local fallback directory
const UPLOADS_DIR = path.join(__dirname, '../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Store uploaded files in memory temporarily.
// They will then be sent to Cloudinary.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

// Local fallback
async function saveLocally(file, prefix = 'img') {
  const ext =
    path.extname(file.originalname).toLowerCase() || '.jpg';

  const cleanExt = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
  ].includes(ext)
    ? ext
    : '.jpg';

  const filename =
    `${prefix}-${Date.now()}-` +
    `${Math.random().toString(36).substring(2, 8)}` +
    cleanExt;

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


// ============================================
// POST /api/uploads/images
// Multiple post images
// Field name: "images"
// Maximum: 6
// ============================================

router.post(
  '/images',
  authRequired,
  upload.array('images', 6),
  async (req, res) => {
    const files = req.files || [];

    if (files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
      });
    }

    try {
      // Use Cloudinary when configured
      if (isConfigured()) {
        const uploaded = await Promise.all(
          files.map((file) =>
            uploadBuffer(
              file.buffer,
              'shohoj/posts'
            )
          )
        );

        return res.json({
          images: uploaded,
        });
      }

      // Local fallback
      const localUploaded = await Promise.all(
        files.map((file) =>
          saveLocally(file, 'post')
        )
      );

      return res.json({
        images: localUploaded,
      });

    } catch (err) {
      console.error('[uploads/images]', err);

      return res.status(500).json({
        error: 'Upload failed: ' + err.message,
      });
    }
  }
);


// ============================================
// POST /api/uploads/avatar
// Single profile image
// Field name: "avatar"
// ============================================

router.post(
  '/avatar',
  authRequired,
  upload.single('avatar'),
  async (req, res) => {

    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
      });
    }

    try {
      if (isConfigured()) {
        const img = await uploadBuffer(
          req.file.buffer,
          'shohoj/avatars'
        );

        return res.json({
          image: img,
        });
      }

      const img = await saveLocally(
        req.file,
        'avatar'
      );

      return res.json({
        image: img,
      });

    } catch (err) {
      console.error('[uploads/avatar]', err);

      return res.status(500).json({
        error: 'Upload failed: ' + err.message,
      });
    }
  }
);


// ============================================
// POST /api/uploads/chat
// Single chat image
// Field name: "image"
// ============================================

router.post(
  '/chat',
  authRequired,
  upload.single('image'),
  async (req, res) => {

    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
      });
    }

    try {
      if (isConfigured()) {
        const img = await uploadBuffer(
          req.file.buffer,
          'shohoj/chat'
        );

        return res.json({
          image: img,
        });
      }

      const img = await saveLocally(
        req.file,
        'chat'
      );

      return res.json({
        image: img,
      });

    } catch (err) {
      console.error('[uploads/chat]', err);

      return res.status(500).json({
        error: 'Upload failed: ' + err.message,
      });
    }
  }
);


module.exports = router;
