const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { getProviders, getBookings, getOnboarding } = require('../services/sculptifyService');

const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many requests, please try again later.' }
});

router.get('/dashboard', adminLimiter, requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const providers = await getProviders();
    const bookings = await getBookings();
    const onboarding = await getOnboarding();

    res.json({
      ok: true,
      metrics: {
        providers: providers.length,
        bookings: bookings.length,
        onboarding: onboarding.length
      },
      latest: {
        booking: bookings[0] || null,
        onboarding: onboarding[0] || null
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
