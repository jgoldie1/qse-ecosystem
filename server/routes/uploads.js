const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png'
]);

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(_req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).replace(/[^a-zA-Z0-9.]/g, '');
    const base = path.basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 64);
    cb(null, `${timestamp}-${base}${ext}`);
  }
});

function fileFilter(_req, file, cb) {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Unsupported file type. Allowed: PDF, DOC, DOCX, JPG, PNG'));
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
});

router.post('/therapist-document', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, message: 'No file uploaded' });
  }
  res.json({ ok: true, message: 'Therapist document uploaded', filename: req.file.filename });
});

router.post('/candidate-document', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, message: 'No file uploaded' });
  }
  res.json({ ok: true, message: 'Candidate document uploaded', filename: req.file.filename });
});

router.post('/employer-document', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, message: 'No file uploaded' });
  }
  res.json({ ok: true, message: 'Employer document uploaded', filename: req.file.filename });
});

module.exports = router;
