const express = require('express');
const router = express.Router();
const sculptifyService = require('../server/services/sculptifyService');

// Providers
router.get('/providers', async (req, res) => {
  try {
    const providers = await sculptifyService.getProviders();
    res.json(providers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/providers/:id', async (req, res) => {
  try {
    const provider = await sculptifyService.updateProvider(req.params.id, req.body);
    if (!provider) return res.status(404).json({ error: 'Provider not found' });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bookings
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await sculptifyService.getBookings();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/bookings', async (req, res) => {
  try {
    const booking = await sculptifyService.createBooking(req.body);
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Onboarding
router.get('/onboarding', async (req, res) => {
  try {
    const records = await sculptifyService.getOnboarding();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/onboarding', async (req, res) => {
  try {
    const record = await sculptifyService.createOnboarding(req.body);
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
