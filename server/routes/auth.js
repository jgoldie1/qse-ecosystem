const express = require('express');
const router = express.Router();
const { registerUser, authenticateUser, getUserById } = require('../services/authService');
const { requireAuth, requireRole } = require('../middleware/auth');
const { writeAudit } = require('../lib/audit');

router.post('/register', requireAuth, requireRole(['admin']), async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body || {};
    const missing = ['name', 'email', 'password', 'role'].filter((k) => !String(req.body?.[k] || '').trim());
    if (missing.length) {
      return res.status(400).json({ ok: false, message: 'Missing required fields', missing });
    }
    const user = await registerUser({ name, email, password, role });
    await writeAudit({
      actorEmail: req.session.user.email,
      action: 'create',
      entityType: 'user',
      entityId: user.id,
      details: { email: user.email, role: user.role }
    });
    res.status(201).json({ ok: true, user });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ ok: false, message: 'User already exists' });
    }
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const user = await authenticateUser({ email: email || '', password: password || '' });
    if (!user) return res.status(401).json({ ok: false, message: 'Invalid credentials' });
    req.session.user = user;
    await writeAudit({
      actorEmail: user.email,
      action: 'login',
      entityType: 'user',
      entityId: user.id,
      details: { role: user.role }
    });
    res.json({ ok: true, message: 'Login successful', user });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', async (req, res) => {
  const actorEmail = req.session?.user?.email || null;
  if (actorEmail) {
    await writeAudit({
      actorEmail,
      action: 'logout',
      entityType: 'user',
      entityId: req.session?.user?.id || null
    });
  }
  req.session.destroy(() => {
    res.json({ ok: true, message: 'Logged out' });
  });
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await getUserById(req.session.user.id);
    res.json({ ok: true, authenticated: true, user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
