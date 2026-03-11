const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { randomUUID } = require('crypto');

const DATA_PATH = path.join(__dirname, '../data/onboarding.json');

const onboardingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions. Please try again later.' }
});

async function load() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

router.post('/', onboardingLimiter, async (req, res) => {
  const { name, email, specialty, experience } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  const submissions = await load();
  const submission = {
    id: randomUUID(),
    name,
    email,
    specialty: specialty || '',
    experience: experience || '',
    status: 'pending',
    submittedAt: new Date().toISOString()
  };
  submissions.push(submission);

  try {
    await fs.writeFile(DATA_PATH, JSON.stringify(submissions, null, 2));
  } catch {
    return res.status(500).json({ error: 'Could not save submission' });
  }

  res.status(201).json({ success: true, id: submission.id });
});

module.exports = router;
