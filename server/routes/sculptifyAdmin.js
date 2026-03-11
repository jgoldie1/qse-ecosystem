const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { getProviders, getBookings, getOnboarding } = require('../services/sculptifyService');

router.get('/dashboard', requireAuth, requireAdmin, async (_req, res, next) => {
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
