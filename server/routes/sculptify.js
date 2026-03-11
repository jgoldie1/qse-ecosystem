const express = require('express');
const router = express.Router();
const { requireFields } = require('../middleware/validate');
const {
  getProviders,
  getBookings,
  createBooking,
  getOnboarding,
  createOnboarding
} = require('../services/sculptifyService');

router.get('/providers', (req, res, next) => {
  try {
    const providers = getProviders();
    res.json({ ok: true, providers });
  } catch (error) {
    next(error);
  }
});

router.get('/bookings', (req, res, next) => {
  try {
    const bookings = getBookings();
    res.json({ ok: true, bookings });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/bookings',
  requireFields(['fullName', 'email', 'service', 'sessionType', 'date']),
  (req, res, next) => {
    try {
      const booking = createBooking(req.body);
      res.status(201).json({ ok: true, message: 'Booking request received', booking });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/onboarding', (req, res, next) => {
  try {
    const onboarding = getOnboarding();
    res.json({ ok: true, onboarding });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/onboarding',
  requireFields(['fullName', 'email', 'phone', 'serviceSpecialty']),
  (req, res, next) => {
    try {
      const submission = createOnboarding(req.body);
      res.status(201).json({ ok: true, message: 'Therapist onboarding received', submission });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
