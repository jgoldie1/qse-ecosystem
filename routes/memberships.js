const express = require('express');
const router = express.Router();
const membershipEngine = require('../core/membership-engine');

router.get('/tiers', (req, res) => {
  const tiers = membershipEngine.getTiers();
  res.json(tiers);
});

router.get('/user/:userId', (req, res) => {
  const membership = membershipEngine.getMembership(req.params.userId);
  if (!membership) return res.status(404).json({ error: 'Membership not found' });
  res.json(membership);
});

router.post('/subscribe', (req, res) => {
  const { userId, tier } = req.body;
  if (!userId || !tier) {
    return res.status(400).json({ error: 'userId and tier are required' });
  }
  const result = membershipEngine.subscribe({ userId, tier });
  if (!result.success) return res.status(400).json({ error: result.error });
  res.status(201).json(result);
});

module.exports = router;
