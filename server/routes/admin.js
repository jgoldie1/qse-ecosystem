const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { listUsers } = require('../services/authService');
const { getBookings, getOnboarding, getProviders } = require('../services/sculptifyService');
const { getJobs, getEmployers, getCandidates } = require('../services/marchLewisService');

router.use(requireAuth, requireAdmin);

router.get('/dashboard', async (_req, res, next) => {
  try {
    const [users, bookings, onboarding, providers, jobs, employers, candidates] = await Promise.all([
      listUsers(),
      getBookings(),
      getOnboarding(),
      getProviders(),
      getJobs(),
      getEmployers(),
      getCandidates()
    ]);

    res.json({
      ok: true,
      metrics: {
        totalUsers: users.length,
        sculptify: {
          providers: providers.length,
          bookings: bookings.length,
          onboarding: onboarding.length
        },
        marchLewis: {
          jobs: jobs.length,
          employers: employers.length,
          candidates: candidates.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/users', async (_req, res, next) => {
  try {
    const users = await listUsers();
    res.json({ ok: true, users });
  } catch (error) {
    next(error);
  }
});

router.get('/sculptify/bookings', async (_req, res, next) => {
  try {
    const bookings = await getBookings();
    res.json({ ok: true, bookings });
  } catch (error) {
    next(error);
  }
});

router.get('/sculptify/onboarding', async (_req, res, next) => {
  try {
    const onboarding = await getOnboarding();
    res.json({ ok: true, onboarding });
  } catch (error) {
    next(error);
  }
});

router.get('/sculptify/providers', async (_req, res, next) => {
  try {
    const providers = await getProviders();
    res.json({ ok: true, providers });
  } catch (error) {
    next(error);
  }
});

router.get('/march-lewis/jobs', async (_req, res, next) => {
  try {
    const jobs = await getJobs();
    res.json({ ok: true, jobs });
  } catch (error) {
    next(error);
  }
});

router.get('/march-lewis/employers', async (_req, res, next) => {
  try {
    const employers = await getEmployers();
    res.json({ ok: true, employers });
  } catch (error) {
    next(error);
  }
});

router.get('/march-lewis/candidates', async (_req, res, next) => {
  try {
    const candidates = await getCandidates();
    res.json({ ok: true, candidates });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
