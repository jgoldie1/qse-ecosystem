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

router.get('/jobs', (req, res, next) => {
  try {
    const jobs = getJobs();
    res.json({ ok: true, jobs });
  } catch (error) {
    next(error);
  }
});

router.get('/employers', (req, res, next) => {
  try {
    const employers = getEmployers();
    res.json({ ok: true, employers });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/employers',
  requireFields(['companyName', 'hiringManager', 'email', 'positionType']),
  (req, res, next) => {
    try {
      const employer = createEmployer(req.body);
      res.status(201).json({ ok: true, message: 'Employer intake received', employer });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/candidates', (req, res, next) => {
  try {
    const candidates = getCandidates();
    res.json({ ok: true, candidates });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/candidates',
  requireFields(['fullName', 'email', 'phone', 'workAuthorization', 'availability']),
  (req, res, next) => {
    try {
      const candidate = createCandidate(req.body);
      res.status(201).json({ ok: true, message: 'Candidate onboarding received', candidate });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
