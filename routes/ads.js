const express = require('express');
const router = express.Router();
const oracle = require('../core/quantum-ad-oracle');

router.get('/plan', (_req,res) => res.json({ok:true, ...oracle.plan(), poweredBy:'Stubbs AI'}));
router.get('/oracle', (_req,res) => res.json({ok:true, ...oracle.recommend()}));
router.get('/metrics', (_req,res) => res.json({ok:true, metrics:oracle.summarize()}));
router.post('/events', (req,res) => {
  const allowed = new Set(['service_view','booking_start','booking_submit','deposit_paid','course_lead','course_purchase','store_purchase','provider_apply']);
  if (!allowed.has(req.body.event)) return res.status(400).json({ok:false,error:'unsupported event'});
  const row = oracle.record(req.body);
  res.status(201).json({ok:true,row});
});

module.exports = router;
