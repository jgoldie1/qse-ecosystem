const express = require('express');
const router = express.Router();
const requestMeta = require('../middleware/requestMeta');

const authRoutes = require('./auth');
const uploadRoutes = require('./uploads');
const sculptifyRoutes = require('./sculptify');
const marchLewisRoutes = require('./marchLewis');
const sculptifyAdminRoutes = require('./sculptifyAdmin');
const marchLewisAdminRoutes = require('./marchLewisAdmin');

router.use(requestMeta);

router.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'qse-core',
    timestamp: new Date().toISOString(),
    requestMeta: req.requestMeta
  });
});

router.use('/auth', authRoutes);
router.use('/uploads', uploadRoutes);
router.use('/sculptify', sculptifyRoutes);
router.use('/march-lewis', marchLewisRoutes);
router.use('/sculptify-admin', sculptifyAdminRoutes);
router.use('/march-lewis-admin', marchLewisAdminRoutes);

module.exports = router;
