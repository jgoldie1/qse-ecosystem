const express = require('express');
const router = express.Router();
const multer = require('multer');

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
  }
});

router.post('/therapist-document', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ ok: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ ok: false, message: 'No file uploaded' });
    }
    res.json({
      ok: true,
      message: `Therapist document "${req.file.originalname}" uploaded successfully`,
      filename: req.file.originalname,
      size: req.file.size
    });
  });
});

router.post('/candidate-document', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ ok: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ ok: false, message: 'No file uploaded' });
    }
    res.json({
      ok: true,
      message: `Candidate document "${req.file.originalname}" uploaded successfully`,
      filename: req.file.originalname,
      size: req.file.size
    });
  });
});

router.post('/employer-document', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ ok: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ ok: false, message: 'No file uploaded' });
    }
    res.json({
      ok: true,
      message: `Employer document "${req.file.originalname}" uploaded successfully`,
      filename: req.file.originalname,
      size: req.file.size
    });
  });
});

module.exports = router;
