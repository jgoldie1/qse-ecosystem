const express = require('express');
const path = require('path');
const router = express.Router();
const { makeUploader } = require('../uploads/storage');

const therapistUpload = makeUploader(path.join(__dirname, '..', '..', 'uploads', 'therapists'));
const candidateUpload = makeUploader(path.join(__dirname, '..', '..', 'uploads', 'candidates'));
const employerUpload = makeUploader(path.join(__dirname, '..', '..', 'uploads', 'employers'));
const generalUpload = makeUploader(path.join(__dirname, '..', '..', 'uploads', 'general'));

router.post('/therapist-document', therapistUpload.single('file'), (req, res) => {
  res.status(201).json({ ok: true, message: 'Therapist document uploaded', file: req.file || null });
});

router.post('/candidate-document', candidateUpload.single('file'), (req, res) => {
  res.status(201).json({ ok: true, message: 'Candidate document uploaded', file: req.file || null });
});

router.post('/employer-document', employerUpload.single('file'), (req, res) => {
  res.status(201).json({ ok: true, message: 'Employer document uploaded', file: req.file || null });
});

router.post('/general', generalUpload.single('file'), (req, res) => {
  res.status(201).json({ ok: true, message: 'General file uploaded', file: req.file || null });
});

module.exports = router;
