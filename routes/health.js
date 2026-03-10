const express = require('express');
const router = express.Router();
const core = require('../core/qse-core');

router.get('/', (req, res) => {
  const status = core.getStatus();
  res.json({
    status: 'ok',
    message: 'QSE Ecosystem is healthy',
    ...status
  });
});

module.exports = router;
