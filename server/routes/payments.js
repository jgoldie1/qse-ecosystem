const express = require('express');
const router = express.Router();
const { requireFields } = require('../middleware/validate');
const {
  getPaymentConfig,
  createCheckoutSession,
  createPaymentIntent,
  createCryptoPayment
} = require('../services/paymentsService');

router.get('/config', (_req, res) => {
  res.json(getPaymentConfig());
});

router.post('/checkout-session', requireFields(['amount', 'currency', 'platform']), (req, res) => {
  res.status(201).json(createCheckoutSession(req.body));
});

router.post('/payment-intent', requireFields(['amount', 'currency', 'method']), (req, res) => {
  res.status(201).json(createPaymentIntent(req.body));
});

router.post('/crypto-payment', requireFields(['amount', 'token', 'chain', 'wallet']), (req, res) => {
  res.status(201).json(createCryptoPayment(req.body));
});

module.exports = router;
