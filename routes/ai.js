const express = require('express');
const router = express.Router();
const aiRouter = require('../core/ai-provider-router');
const aiCoach = require('../core/ai-coach');

router.post('/coach', async (req, res) => {
  const { userId, message, context } = req.body;
  if (!message) return res.status(400).json({ error: 'message is required' });
  try {
    const response = await aiRouter.respond({ userId, message, context });
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'HoloGPT is temporarily unavailable', poweredBy: 'Stubbs AI' });
  }
});

router.get('/coach/tips', (req, res) => {
  res.json({ tips: aiCoach.getMotivationalTips(), assistant: 'HoloGPT', poweredBy: 'Stubbs AI' });
});

module.exports = router;
