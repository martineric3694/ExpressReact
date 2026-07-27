// ============================================================
// File: server/controllers/AuthController.js
// ============================================================

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
require('dotenv').config();

const AuthController = {
  // ----------------------------------------------------------------
  // POST /api/auth/login
  // ----------------------------------------------------------------
  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    try {
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Email atau password salah' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: 'Email atau password salah' });
      }

      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
      );

      // Simpan token di httpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge:   24 * 60 * 60 * 1000 // 1 hari
      });

      res.json({
        message: 'Login berhasil',
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // ----------------------------------------------------------------
  // POST /api/auth/register
  // ----------------------------------------------------------------
  async register(req, res) {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password dan konfirmasi password tidak cocok' });
    }

    try {
      const existing = await User.findByEmail(email);
      if (existing) {
        return res.status(409).json({ message: 'Email sudah terdaftar' });
      }

      const hashed = await bcrypt.hash(password, 10);
      await User.create({ name, email, password: hashed });

      res.status(201).json({ message: 'Registrasi berhasil. Silakan login.' });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // ----------------------------------------------------------------
  // POST /api/auth/logout
  // ----------------------------------------------------------------
  logout(req, res) {
    res.clearCookie('token');
    res.json({ message: 'Logout berhasil' });
  },

  // ----------------------------------------------------------------
  // GET /api/auth/me  → kembalikan data user dari token
  // ----------------------------------------------------------------
  me(req, res) {
    res.json({ user: req.user });
  }
};

module.exports = AuthController;
