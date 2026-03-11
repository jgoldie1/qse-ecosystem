const express = require('express');
const router = express.Router();
const {
  getProviders,
  getBookings,
  getOnboarding
} = require('../services/sculptifyService');

router.get('/dashboard', async (_req, res, next) => {
  try {
    const [providers, bookings, onboarding] = await Promise.all([
      getProviders(),
      getBookings(),
      getOnboarding()
    ]);
    res.json({
      ok: true,
      metrics: {
        providers: providers.length,
        bookings: bookings.length,
        onboarding: onboarding.length
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
