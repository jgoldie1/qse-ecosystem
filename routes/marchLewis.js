const express = require('express');
const router = express.Router();
const marchLewisService = require('../server/services/marchLewisService');

// Jobs
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await marchLewisService.getJobs();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/jobs/:id', async (req, res) => {
  try {
    const job = await marchLewisService.updateJob(req.params.id, req.body);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Employers
router.get('/employers', async (req, res) => {
  try {
    const employers = await marchLewisService.getEmployers();
    res.json(employers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/employers', async (req, res) => {
  try {
    const employer = await marchLewisService.createEmployer(req.body);
    res.status(201).json(employer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Candidates
router.get('/candidates', async (req, res) => {
  try {
    const candidates = await marchLewisService.getCandidates();
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/candidates', async (req, res) => {
  try {
    const candidate = await marchLewisService.createCandidate(req.body);
    res.status(201).json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
