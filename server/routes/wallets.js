const express = require('express');
const router = express.Router();
const walletEngine = require('../services/wallet-engine');

router.get('/:userId', (req, res) => {
  const wallet = walletEngine.getWallet(req.params.userId);
  res.json(wallet);
});

router.post('/transfer', (req, res) => {
  const { fromUserId, toUserId, amount, currency } = req.body;
  if (!fromUserId || !toUserId || !amount) {
    return res.status(400).json({ error: 'fromUserId, toUserId, and amount are required' });
  }
  const result = walletEngine.transfer({ fromUserId, toUserId, amount, currency });
  if (!result.success) return res.status(400).json({ error: result.error });
  res.json(result);
});

router.post('/earn', (req, res) => {
  const { userId, amount, reason } = req.body;
  if (!userId || !amount) {
    return res.status(400).json({ error: 'userId and amount are required' });
  }
  const wallet = walletEngine.earn({ userId, amount, reason });
  res.json(wallet);
});

module.exports = router;
