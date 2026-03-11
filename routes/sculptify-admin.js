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
      providers: 0,
      bookings: 0,
      onboarding: 0
    },
    latest: {
      booking: null,
      onboarding: null
    }
  });
});

module.exports = router;
