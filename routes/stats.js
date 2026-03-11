const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');

const DATA_PATH = path.join(__dirname, '../data/analytics.json');

const statsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});

router.get('/', statsLimiter, (req, res) => {
  try {
    const analytics = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
    res.json(analytics);
  } catch {
    res.json({});
  }
});

module.exports = router;
