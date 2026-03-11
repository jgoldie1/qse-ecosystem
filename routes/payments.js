const express = require('express');
const router = express.Router();
const paymentsEngine = require('../core/payments-engine');

router.get('/', (req, res) => {
  res.json(paymentsEngine.getAll());
});

router.get('/user/:userId', (req, res) => {
  res.json(paymentsEngine.getForUser(req.params.userId));
});

router.post('/process', (req, res) => {
  const { fromUserId, toUserId, amount, description } = req.body;
  if (!fromUserId || !toUserId || !amount) {
    return res.status(400).json({ error: 'fromUserId, toUserId, and amount are required' });
  }
  if (Number(amount) <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }
  const result = paymentsEngine.processPayment({ fromUserId, toUserId, amount, description });
  if (!result.success) return res.status(400).json({ error: result.error });
  res.status(201).json(result);
});

module.exports = router;
