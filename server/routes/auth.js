const express = require('express');
const router = express.Router();
const { registerUser, authenticateUser, getUserById } = require('../services/authService');
const { generateToken, requireAuth } = require('../middleware/auth');

router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    const user = await registerUser({ fullName, email, password });
    res.status(201).json({ ok: true, user });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authenticateUser({ email, password });
    if (!user) return res.status(401).json({ ok: false, message: 'Invalid credentials' });
    const token = generateToken({ id: user.id, email: user.email });
    res.json({ ok: true, token, user });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id);
    res.json({ ok: true, user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
