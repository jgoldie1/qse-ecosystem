const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const AVAILABILITY_PATH = path.join(__dirname, '../data/scheduling-availability.json');
const INTERVIEWS_PATH = path.join(__dirname, '../data/scheduling-interviews.json');

function loadFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}

router.get('/sculptify-availability', (_req, res, next) => {
  try {
    const availability = loadFile(AVAILABILITY_PATH);
    res.json({ ok: true, availability });
  } catch (error) {
    next(error);
  }
});

router.get('/march-lewis-interviews', (_req, res, next) => {
  try {
    const interviews = loadFile(INTERVIEWS_PATH);
    res.json({ ok: true, interviews });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
