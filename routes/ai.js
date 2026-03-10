const express = require('express');
const router = express.Router();
const aiCoach = require('../core/ai-coach');

router.post('/coach', (req, res) => {
  const { userId, message, context } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }
  const response = aiCoach.respond({ userId, message, context });
  res.json(response);
});

router.get('/coach/tips', (req, res) => {
  const tips = aiCoach.getMotivationalTips();
  res.json({ tips });
});

module.exports = router;
