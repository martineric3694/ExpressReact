// ============================================================
// File: server/app.js  –  Express REST API Entry Point
// ============================================================

require('dotenv').config();

const express      = require('express');
const cookieParser = require('cookie-parser');
const cors         = require('cors');
const path         = require('path');

const authRoutes    = require('./routes/auth');
const productRoutes = require('./routes/products');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS ────────────────────────────────────────────────────
// Izinkan request dari Vite dev server (localhost maupun IP LAN)
const allowedOrigins = (process.env.CLIENT_URL || 'https://expressreact-3ph8.onrender.com')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (misal: Postman, curl)
    if (!origin||allowedOrigins.includes(origin)) return callback(null, true);
    // if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} tidak diizinkan`));
  },
  credentials: true   // izinkan cookie lintas origin
}));

// ── Middleware ──────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);

// Dashboard info (protected) – cukup kembalikan data user
const { authMiddleware } = require('./middleware/auth');
app.get('/api/dashboard', authMiddleware, (req, res) => {
  res.json({
    message: 'Selamat datang di Dashboard',
    user:    req.user
  });
});

// ── 404 handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route tidak ditemukan' });
});

// ── Error handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Terjadi kesalahan server' });
});

// ── Start server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 API server berjalan di http://localhost:${PORT}`);
});
