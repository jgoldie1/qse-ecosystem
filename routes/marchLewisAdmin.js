const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { getJobs, getEmployers, getCandidates } = require('../services/marchLewisService');

const adminLimiter = rateLimit({ windowMs: 60_000, max: 60, standardHeaders: true, legacyHeaders: false });

router.get('/dashboard', adminLimiter, requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const jobs = await getJobs();
    const employers = await getEmployers();
    const candidates = await getCandidates();

    res.json({
      ok: true,
      metrics: {
        jobs: jobs.length,
        employers: employers.length,
        candidates: candidates.length
      },
      latest: {
        employer: employers[0] || null,
        candidate: candidates[0] || null
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
