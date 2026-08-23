require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// --- CORS ---
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin / server-to-server / curl (no origin header)
      if (!origin) return cb(null, true);
      // Allow all in dev if CORS_ORIGIN is empty
      if (allowedOrigins.length === 0) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error('Origin ' + origin + ' not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));

// --- Health ---
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'shohoj-backend',
    time: new Date().toISOString(),
  });
});

const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded assets statically
app.use('/uploads', express.static(uploadsDir));

// --- Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/uploads', require('./routes/uploads'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/notifications', require('./routes/notifications'));

// 404 for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Root
app.get('/', (req, res) => {
  res.type('text/plain').send('Shohoj backend is running. Try GET /api/health');
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[error]', err);
  res.status(500).json({ error: err.message || 'Server error' });
});

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[shohoj] backend listening on http://localhost:${PORT}`);
  });
}

if (require.main === module) start();
module.exports = app;
