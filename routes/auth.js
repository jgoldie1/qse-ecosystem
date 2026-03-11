const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { issueToken, validateCredentials } = require('../middleware/auth');

const loginLimiter = rateLimit({ windowMs: 15 * 60_000, max: 10, standardHeaders: true, legacyHeaders: false });

router.post('/login', loginLimiter, (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ ok: false, error: 'email and password are required' });
  }
  const user = validateCredentials(email, password);
  if (!user) {
    return res.status(401).json({ ok: false, error: 'Invalid credentials' });
  }
  const token = issueToken(user);
  res.json({ ok: true, token, user: { id: user.id, email: user.email, role: user.role } });
});

module.exports = router;
