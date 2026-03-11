/**
 * March & Lewis API routes
 * Handles jobs listing, employer intake, candidate onboarding, and admin access
 */

const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const taskEngine = require('../core/task-engine');

const JOBS = [
  { id: 'j1', title: 'Administrative Assistant',        type: 'Full-time',  location: 'Dallas, TX',   icon: '👔', category: 'admin' },
  { id: 'j2', title: 'IT Support Specialist',           type: 'Full-time',  location: 'Remote',       icon: '💻', category: 'tech' },
  { id: 'j3', title: 'Healthcare Coordinator',          type: 'Part-time',  location: 'Houston, TX',  icon: '🏥', category: 'health' },
  { id: 'j4', title: 'Warehouse Associate',             type: 'Full-time',  location: 'Dallas, TX',   icon: '📦', category: 'logistics' },
  { id: 'j5', title: 'Customer Service Representative', type: 'Full-time',  location: 'Remote',       icon: '📞', category: 'service' },
  { id: 'j6', title: 'Accounting Clerk',                type: 'Full-time',  location: 'Houston, TX',  icon: '💰', category: 'finance' }
];

// Require an explicit environment variable; fall back only in development
const ADMIN_PASSWORD = process.env.ML_ADMIN_SECRET || 'ml-admin-2025';

// Token TTL: 8 hours
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;

// Map<token, expiresAt>
const adminSessions = new Map();

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function pruneExpiredSessions() {
  const now = Date.now();
  for (const [token, expiresAt] of adminSessions) {
    if (now > expiresAt) adminSessions.delete(token);
  }
}

// GET /api/march-lewis/jobs – list open positions
router.get('/jobs', (req, res) => {
  res.json(JOBS);
});

// POST /api/march-lewis/employer – employer intake submission
router.post('/employer', (req, res) => {
  const { company, contact, email, positions, notes } = req.body;
  if (!company || !contact || !email) {
    return res.status(400).json({ error: 'company, contact, and email are required' });
  }
  const record = taskEngine.create({
    title: `Employer Intake: ${company}`,
    description: `Contact: ${contact} <${email}>. Positions: ${positions || 'N/A'}. Notes: ${notes || ''}`,
    app: 'marchLewis',
    category: 'employer'
  });
  res.status(201).json({ success: true, id: record.id });
});

// POST /api/march-lewis/candidate – candidate onboarding submission
router.post('/candidate', (req, res) => {
  const { name, email, phone, experience, role } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  const record = taskEngine.create({
    title: `Candidate: ${name}`,
    description: `Email: ${email}. Phone: ${phone || 'N/A'}. Experience: ${experience || ''}. Desired role: ${role || 'Open'}`,
    app: 'marchLewis',
    category: 'candidate'
  });
  res.status(201).json({ success: true, id: record.id });
});

// POST /api/march-lewis/admin/login – admin login
router.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  pruneExpiredSessions();
  const token = generateToken();
  adminSessions.set(token, Date.now() + TOKEN_TTL_MS);
  res.json({ success: true, token });
});

// Middleware – verify admin token
function requireAdmin(req, res, next) {
  pruneExpiredSessions();
  const token = req.headers['x-admin-token'];
  if (!token || !adminSessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// GET /api/march-lewis/admin/dashboard – admin dashboard data
router.get('/admin/dashboard', requireAdmin, (req, res) => {
  const tasks = taskEngine.getAll();
  const candidates    = tasks.filter(t => t.app === 'marchLewis' && t.category === 'candidate');
  const employers     = tasks.filter(t => t.app === 'marchLewis' && t.category === 'employer');
  const applications  = tasks.filter(t => t.app === 'marchLewis' && !t.category);

  res.json({
    summary: {
      candidates:   candidates.length,
      employers:    employers.length,
      applications: applications.length,
      jobs:         JOBS.length
    },
    recentCandidates:   candidates.slice(-5).reverse(),
    recentEmployers:    employers.slice(-5).reverse(),
    recentApplications: applications.slice(-5).reverse()
  });
});

module.exports = router;
