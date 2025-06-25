const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

class AuthService {
  // PUBLIC_INTERFACE
  async createUser({ name, email, password }) {
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      const err = new Error('Email already registered');
      err.code = 'DUPLICATE_EMAIL';
      throw err;
    }
    const hashed = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING id,name,email,created_at',
      [name, email, hashed]
    );
    return result.rows[0];
  }

  // PUBLIC_INTERFACE
  async loginUser({ email, password }) {
    const userRes = await db.query('SELECT * FROM users WHERE email=$1', [email]);
    if (userRes.rows.length === 0) throw new Error('Incorrect email or password');
    const user = userRes.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Incorrect email or password');
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
    return token;
  }
}

module.exports = new AuthService();
