const express = require('express');
const router = express.Router();
const rewardsEngine = require('../services/rewards-engine');

router.get('/', (req, res) => {
  const rewards = rewardsEngine.getAll();
  res.json(rewards);
});

router.get('/user/:userId', (req, res) => {
  const rewards = rewardsEngine.getForUser(req.params.userId);
  res.json(rewards);
});

router.post('/issue', (req, res) => {
  const { userId, type, amount } = req.body;
  if (!userId || !type) {
    return res.status(400).json({ error: 'userId and type are required' });
  }
  const reward = rewardsEngine.issue({ userId, type, amount });
  res.status(201).json(reward);
});

module.exports = router;
