const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authEngine = require('../core/auth-engine');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/login', loginLimiter, (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const result = authEngine.login({ email, password });
  if (!result.success) {
    return res.status(401).json({ error: result.error });
  }

  res.json(result);
});

module.exports = router;
