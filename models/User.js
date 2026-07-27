const db = require('../config/database');

const User = {
  /**
   * Temukan user berdasarkan email
   */
  async findByEmail(email) {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0] || null;
  },

  /**
   * Temukan user berdasarkan ID
   */
  async findById(id) {
    const [rows] = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Buat user baru
   */
  async create({ name, email, password, role = 'user' }) {
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    return result.insertId;
  }
};

module.exports = User;
