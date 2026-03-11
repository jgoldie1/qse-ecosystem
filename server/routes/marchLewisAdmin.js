const express = require('express');
const router = express.Router();
const {
  getJobs,
  getEmployers,
  getCandidates
} = require('../services/marchLewisService');

router.get('/dashboard', async (_req, res, next) => {
  try {
    const [jobs, employers, candidates] = await Promise.all([
      getJobs(),
      getEmployers(),
      getCandidates()
    ]);
    res.json({
      ok: true,
      metrics: {
        jobs: jobs.length,
        employers: employers.length,
        candidates: candidates.length
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
