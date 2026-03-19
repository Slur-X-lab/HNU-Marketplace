const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../config/email');

const HNU_DOMAIN = '@hnu.edu.ph';

// Generate a random 6-digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, course, year_level } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: 'Name, email and password are required.' });

  if (!email.toLowerCase().endsWith(HNU_DOMAIN))
    return res.status(400).json({ message: `Only HNU email addresses (${HNU_DOMAIN}) are allowed.` });

  try {
    const [existing] = await db.query('SELECT id, is_verified FROM users WHERE email = ?', [email.toLowerCase()]);

    if (existing.length > 0 && existing[0].is_verified)
      return res.status(409).json({ message: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 12);
    const code = generateCode();
    const codeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    if (existing.length > 0 && !existing[0].is_verified) {
      // Update existing unverified account
      await db.query(
        'UPDATE users SET name=?, password=?, course=?, year_level=?, verification_token=?, verification_token_expires=? WHERE email=?',
        [name, hashed, course || null, year_level || null, code, codeExpires, email.toLowerCase()]
      );
    } else {
      await db.query(
        'INSERT INTO users (name, email, password, course, year_level, is_verified, verification_token, verification_token_expires) VALUES (?, ?, ?, ?, ?, FALSE, ?, ?)',
        [name, email.toLowerCase(), hashed, course || null, year_level || null, code, codeExpires]
      );
    }

    try {
      await sendVerificationEmail(email.toLowerCase(), name, code);
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr.message);
    }

    res.status(201).json({
      message: 'Registration successful! A 6-digit verification code has been sent to your email.',
      requiresVerification: true,
      email: email.toLowerCase()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// POST /api/auth/verify-email  { email, code }
router.post('/verify-email', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code)
    return res.status(400).json({ message: 'Email and code are required.' });

  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? AND verification_token = ? AND verification_token_expires > NOW()',
      [email.toLowerCase(), code.trim()]
    );

    if (rows.length === 0)
      return res.status(400).json({ message: 'Invalid or expired code. Please try again.' });

    const user = rows[0];
    await db.query(
      'UPDATE users SET is_verified = TRUE, verification_token = NULL, verification_token_expires = NULL WHERE id = ?',
      [user.id]
    );

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Email verified! Welcome to HNU Marketplace 🎉',
      token,
      user: {
        id: user.id, name: user.name, email: user.email,
        avatar: user.avatar, course: user.course,
        year_level: user.year_level, is_verified: true
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during verification.' });
  }
});

// POST /api/auth/resend-verification  { email }
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (rows.length === 0) return res.status(404).json({ message: 'Email not found.' });

    const user = rows[0];
    if (user.is_verified) return res.status(400).json({ message: 'Email is already verified.' });

    const code = generateCode();
    const codeExpires = new Date(Date.now() + 15 * 60 * 1000);

    await db.query(
      'UPDATE users SET verification_token = ?, verification_token_expires = ? WHERE id = ?',
      [code, codeExpires, user.id]
    );

    await sendVerificationEmail(user.email, user.name, code);
    res.json({ message: 'A new verification code has been sent to your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required.' });

  if (!email.toLowerCase().endsWith(HNU_DOMAIN))
    return res.status(400).json({ message: `Only HNU email addresses (${HNU_DOMAIN}) are allowed.` });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (rows.length === 0)
      return res.status(401).json({ message: 'Invalid email or password.' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Invalid email or password.' });

    if (!user.is_verified)
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        requiresVerification: true,
        email: user.email
      });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id, name: user.name, email: user.email,
        avatar: user.avatar, course: user.course,
        year_level: user.year_level, is_verified: user.is_verified
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (rows.length === 0)
      return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const user = rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await db.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, resetExpires, user.id]
    );

    await sendPasswordResetEmail(user.email, user.name, resetToken);
    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ message: 'Token and new password are required.' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );

    if (rows.length === 0)
      return res.status(400).json({ message: 'Invalid or expired reset token.' });

    const hashed = await bcrypt.hash(password, 12);
    await db.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashed, rows[0].id]
    );

    res.json({ message: 'Password reset successfully! You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, avatar, course, year_level, is_verified, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, async (req, res) => {
  const { name, course, year_level } = req.body;
  try {
    await db.query(
      'UPDATE users SET name = ?, course = ?, year_level = ? WHERE id = ?',
      [name, course, year_level, req.user.id]
    );
    res.json({ message: 'Profile updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
