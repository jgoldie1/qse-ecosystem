const express = require('express');
const router = express.Router();
const { getDashboardMetrics } = require('../services/sculptifyService');

router.get('/dashboard', (req, res, next) => {
  try {
    const metrics = getDashboardMetrics();
    res.json({ ok: true, metrics });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
