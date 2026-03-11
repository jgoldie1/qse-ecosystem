const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@qse.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

const activeTokens = new Map(); // token -> expiry timestamp

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: 'Too many login attempts. Please try again later.' }
});

router.post('/login', loginLimiter, (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ ok: false, message: 'Email and password are required' });
  }
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, message: 'Invalid credentials' });
  }
  const token = crypto.randomBytes(32).toString('hex');
  activeTokens.set(token, Date.now() + TOKEN_TTL_MS);
  res.json({ ok: true, token });
});

function verifyToken(token) {
  if (!token) return false;
  const expiry = activeTokens.get(token);
  if (!expiry) return false;
  if (Date.now() > expiry) {
    activeTokens.delete(token);
    return false;
  }
  return true;
}

router.verifyToken = verifyToken;

module.exports = router;
