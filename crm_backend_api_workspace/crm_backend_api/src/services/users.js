const db = require('../db');

class UsersService {
  // PUBLIC_INTERFACE
  async getUserById(userId) {
    const res = await db.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [userId]);
    return res.rows[0] || null;
  }
}

module.exports = new UsersService();
