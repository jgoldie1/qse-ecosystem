const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const requireAdmin = require('./admin-auth');

const dashboardLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});

router.get('/dashboard', dashboardLimiter, requireAdmin, (_req, res) => {
  res.json({
    ok: true,
    metrics: {
      jobs: 0,
      employers: 0,
      candidates: 0
    },
    latest: {
      employer: null,
      candidate: null
    }
  });
});

module.exports = router;
