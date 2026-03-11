const express = require('express');
const router = express.Router();
const paymentsEngine = require('../core/payments-engine');

router.get('/config', (req, res) => {
  const config = paymentsEngine.getConfig();
  res.json({ ok: true, ...config });
});

router.post('/checkout-session', (req, res) => {
  const { amount, currency, platform, itemType } = req.body;
  if (!amount || !currency) {
    return res.status(400).json({ ok: false, message: 'amount and currency are required' });
  }
  const result = paymentsEngine.createCheckoutSession({ amount, currency, platform, itemType });
  if (!result.success) {
    return res.status(400).json({ ok: false, message: result.error });
  }
  res.status(201).json({ ok: true, message: 'Checkout session created', session: result.session });
});

router.post('/crypto-payment', (req, res) => {
  const { amount, token, chain, wallet } = req.body;
  if (!amount || !token) {
    return res.status(400).json({ ok: false, message: 'amount and token are required' });
  }
  const result = paymentsEngine.createCryptoPayment({ amount, token, chain, wallet });
  if (!result.success) {
    return res.status(400).json({ ok: false, message: result.error });
  }
  res.status(201).json({ ok: true, message: 'Crypto payment created', payment: result.payment });
});

module.exports = router;
