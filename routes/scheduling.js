const express = require('express');
const router = express.Router();
const { requireFields } = require('../middleware/validate');
const {
  getAvailability,
  createAvailability,
  getInterviews,
  createInterview
} = require('../services/schedulingService');

router.get('/sculptify-availability', async (_req, res, next) => {
  try {
    const availability = await getAvailability();
    res.json({ ok: true, availability });
  } catch (error) {
    next(error);
  }
});

router.post('/sculptify-availability', requireFields(['providerName', 'service', 'slotDate', 'slotTime']), async (req, res, next) => {
  try {
    const slot = await createAvailability(req.body);
    res.status(201).json({ ok: true, message: 'Availability slot created', slot });
  } catch (error) {
    next(error);
  }
});

router.get('/march-lewis-interviews', async (_req, res, next) => {
  try {
    const interviews = await getInterviews();
    res.json({ ok: true, interviews });
  } catch (error) {
    next(error);
  }
});

router.post('/march-lewis-interviews', requireFields(['candidateName', 'companyName', 'interviewDate', 'interviewTime']), async (req, res, next) => {
  try {
    const interview = await createInterview(req.body);
    res.status(201).json({ ok: true, message: 'Interview scheduled', interview });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
