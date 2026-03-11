const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { randomUUID } = require('crypto');

const taskEngine = require('../core/task-engine');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sculptify-admin';

// In-memory session store (sufficient for single-process demo)
const activeSessions = new Set();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' }
});

const dashboardLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/login', loginLimiter, (req, res) => {
  const { password } = req.body;
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = randomUUID();
  activeSessions.add(token);
  res.json({ success: true, token });
});

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token || !activeSessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

router.get('/dashboard', dashboardLimiter, requireAdmin, (req, res) => {
  const tasks = taskEngine.getAll();
  const sculptifyTasks = tasks.filter(t => t.app === 'sculptify');

  let onboarding = [];
  try {
    onboarding = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/onboarding.json'), 'utf8')
    );
  } catch {
    onboarding = [];
  }

  let analytics = {};
  try {
    analytics = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/analytics.json'), 'utf8')
    );
  } catch {
    analytics = {};
  }

  res.json({
    stats: analytics.sculptify || {},
    recentBookings: sculptifyTasks.slice(-10).reverse(),
    onboarding,
    totalBookings: sculptifyTasks.length
  });
});

module.exports = router;
