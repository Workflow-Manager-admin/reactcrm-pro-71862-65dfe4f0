const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const authService = require('../services/auth');

// PUBLIC_INTERFACE
class AuthController {
  /**
   * @swagger
   * /auth/signup:
   *   post:
   *     summary: Sign up a new user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - password
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 format: password
   *     responses:
   *       201:
   *         description: User registered
   *       400:
   *         description: Invalid request
   */
  async signup(req, res) {
    // Validate
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({status: 'fail', errors: errors.array() });
    }
    try {
      const { name, email, password } = req.body;
      const user = await authService.createUser({ name, email, password });
      return res.status(201).json({ status: 'ok', message: 'User registered', userId: user.id });
    } catch (err) {
      if (err.code === 'DUPLICATE_EMAIL') {
        return res.status(409).json({ status: 'fail', message: 'Email already exists' });
      }
      return res.status(500).json({ status: 'error', message: err.message });
    }
  }

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Log in a user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 format: password
   *     responses:
   *       200:
   *         description: Successful login
   *       401:
   *         description: Unauthorized
   */
  async login(req, res) {
    // Validate
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({status: 'fail', errors: errors.array() });
    }
    try {
      const { email, password } = req.body;
      const token = await authService.loginUser({ email, password });
      return res.status(200).json({ status: 'ok', token });
    } catch (err) {
      return res.status(401).json({ status: 'fail', message: err.message });
    }
  }
}

module.exports = new AuthController();
