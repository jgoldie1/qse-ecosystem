const express = require('express');
const router = express.Router();
const { requireFields } = require('../middleware/validate');
const {
  getJobs,
  getEmployers,
  createEmployer,
  getCandidates,
  createCandidate
} = require('../services/marchLewisService');

router.get('/jobs', async (_req, res, next) => {
  try {
    const jobs = await getJobs();
    res.json({ ok: true, jobs });
  } catch (error) {
    next(error);
  }
});

router.get('/employers', async (_req, res, next) => {
  try {
    const employers = await getEmployers();
    res.json({ ok: true, employers });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/employers',
  requireFields(['companyName', 'hiringManager', 'email', 'positionType']),
  async (req, res, next) => {
    try {
      const employer = await createEmployer(req.body);
      res.status(201).json({ ok: true, message: 'Employer intake received', employer });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/candidates', async (_req, res, next) => {
  try {
    const candidates = await getCandidates();
    res.json({ ok: true, candidates });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/candidates',
  requireFields(['fullName', 'email', 'phone', 'workAuthorization', 'availability']),
  async (req, res, next) => {
    try {
      const candidate = await createCandidate(req.body);
      res.status(201).json({ ok: true, message: 'Candidate onboarding received', candidate });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
