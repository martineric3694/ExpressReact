// ============================================================
// File: server/middleware/auth.js
// ============================================================

const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware: verifikasi JWT dari cookie
 * Untuk REST API → response 401 JSON, bukan redirect
 */
function authMiddleware(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized. Silakan login terlebih dahulu.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, email, role }
    next();
  } catch (err) {
    res.clearCookie('token');
    return res.status(401).json({ message: 'Token tidak valid atau sudah kadaluarsa.' });
  }
}

/**
 * Middleware: cegah user yang sudah login mengakses endpoint login/register
 */
function guestMiddleware(req, res, next) {
  const token = req.cookies?.token;
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.status(400).json({ message: 'Anda sudah login.' });
    } catch {
      res.clearCookie('token');
    }
  }
  next();
}

module.exports = { authMiddleware, guestMiddleware };
