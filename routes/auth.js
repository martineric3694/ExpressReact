// ============================================================
// File: server/routes/auth.js
// ============================================================

const express        = require('express');
const router         = express.Router();
const AuthController = require('../controllers/AuthController');
const { authMiddleware, guestMiddleware } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login',    guestMiddleware, AuthController.login);

// POST /api/auth/register
router.post('/register', guestMiddleware, AuthController.register);

// POST /api/auth/logout
router.post('/logout', AuthController.logout);

// GET  /api/auth/me  → cek sesi user yang sedang login
router.get('/me', authMiddleware, AuthController.me);

module.exports = router;
