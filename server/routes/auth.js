const express = require('express');
const router = express.Router();
const { requireFields } = require('../middleware/validate');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { listUsers, registerUser, loginUser } = require('../services/authService');

router.get('/users', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const users = await listUsers();
    res.json({ ok: true, users });
  } catch (error) {
    next(error);
  }
});

router.post('/register', requireFields(['email', 'password']), async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ ok: true, message: 'User registered', user });
  } catch (error) {
    next(error);
  }
});

router.post('/login', requireFields(['email', 'password']), async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    res.json({ ok: true, message: 'Login successful', ...result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
