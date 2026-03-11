const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { requireFields } = require('../middleware/validate');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { listUsers, registerUser, loginUser } = require('../services/authService');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many requests, please try again later.' }
});

router.get('/users', authLimiter, requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const users = await listUsers();
    res.json({ ok: true, users });
  } catch (error) {
    next(error);
  }
});

router.post('/register', authLimiter, requireFields(['email', 'password']), async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ ok: true, message: 'User registered', user });
  } catch (error) {
    next(error);
  }
});

router.post('/login', authLimiter, requireFields(['email', 'password']), async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    res.json({ ok: true, message: 'Login successful', ...result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
