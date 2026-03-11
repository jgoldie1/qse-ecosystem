const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5000;

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const sculptifyDir = path.join(root, 'apps', 'sculptify-web', 'public');
const marchDir = path.join(root, 'apps', 'march-lewis-web', 'public');
const dataDir = path.join(root, 'data');
const uploadRoot = path.join(root, 'uploads');
const usersFile = path.join(dataDir, 'users.json');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback = []) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

function appendJson(file, row) {
  const rows = readJson(file, []);
  rows.push(row);
  writeJson(file, rows);
  return row;
}

function updateById(file, id, patch) {
  const rows = readJson(file, []);
  const index = rows.findIndex((row) => String(row.id) === String(id));
  if (index === -1) return null;
  rows[index] = { ...rows[index], ...patch, updatedAt: new Date().toISOString() };
  writeJson(file, rows);
  return rows[index];
}

function deleteById(file, id) {
  const rows = readJson(file, []);
  const nextRows = rows.filter((row) => String(row.id) !== String(id));
  if (nextRows.length === rows.length) return false;
  writeJson(file, nextRows);
  return true;
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password, passwordHash, ...safe } = user;
  return safe;
}

function findByQuery(rows, q, fields) {
  const query = String(q || '').trim().toLowerCase();
  if (!query) return rows;
  return rows.filter((row) =>
    fields.some((field) => String(row[field] || '').toLowerCase().includes(query))
  );
}

function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ ok: false, message: 'Authentication required' });
  }
  return res.redirect('/login');
}

function requireRole(roles = []) {
  return function(req, res, next) {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ ok: false, message: 'Authentication required' });
    }
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({ ok: false, message: 'Insufficient permissions' });
    }
    next();
  };
}

// Simple in-memory rate limiter
const _rateLimitStore = new Map();
function rateLimit(windowMs, max) {
  return function(req, res, next) {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;
    const hits = (_rateLimitStore.get(key) || []).filter((t) => t > windowStart);
    hits.push(now);
    _rateLimitStore.set(key, hits);
    if (hits.length > max) {
      return res.status(429).json({ ok: false, message: 'Too many requests, please try again later' });
    }
    next();
  };
}

// CSRF protection: generate token on session, validate on state-changing requests
function csrfToken(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  next();
}

function csrfProtection(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const token = req.headers['x-csrf-token'];
  if (!token || !req.session || token !== req.session.csrfToken) {
    return res.status(403).json({ ok: false, message: 'CSRF token validation failed' });
  }
  next();
}

async function ensureAdminUser() {
  ensureDir(dataDir);
  const users = readJson(usersFile, []);
  const existing = users.find((u) => String(u.email).toLowerCase() === 'admin@qse.local');

  if (existing) {
    if (!existing.passwordHash) {
      existing.passwordHash = await bcrypt.hash('ChangeMe123!', 10);
      delete existing.password;
      writeJson(usersFile, users);
    }
    return;
  }

  users.push({
    id: Date.now(),
    name: 'QSE Admin',
    email: 'admin@qse.local',
    passwordHash: await bcrypt.hash('ChangeMe123!', 10),
    role: 'admin',
    createdAt: new Date().toISOString()
  });

  writeJson(usersFile, users);
}

ensureDir(dataDir);
ensureDir(uploadRoot);
ensureDir(path.join(uploadRoot, 'therapists'));
ensureDir(path.join(uploadRoot, 'candidates'));
ensureDir(path.join(uploadRoot, 'employers'));

if (!process.env.SESSION_SECRET) {
  console.warn('WARNING: SESSION_SECRET is not set. Using insecure default secret. Set SESSION_SECRET in production.');
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'qse-local-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 8
  }
}));

// Attach CSRF token to session for all requests
app.use(csrfToken);

// Apply CSRF protection to all API state-changing requests
app.use('/api/', csrfProtection);

app.use('/sculptify/assets', express.static(path.join(sculptifyDir, 'assets')));
app.use('/march-lewis/assets', express.static(path.join(marchDir, 'assets')));
app.use('/uploads', express.static(uploadRoot));

// Static public apps
app.use('/sculptify', express.static(sculptifyDir));
app.use('/march-lewis', express.static(marchDir));
app.use(express.static(publicDir));

const spaRateLimit = rateLimit(60 * 1000, 120);

// SPA fallbacks for public apps
app.get('/sculptify/*', spaRateLimit, (_req, res) => res.sendFile(path.join(sculptifyDir, 'index.html')));
app.get('/march-lewis/*', spaRateLimit, (_req, res) => res.sendFile(path.join(marchDir, 'index.html')));

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    let target = path.join(uploadRoot, 'misc');
    if (req.path.includes('therapist')) target = path.join(uploadRoot, 'therapists');
    if (req.path.includes('candidate')) target = path.join(uploadRoot, 'candidates');
    if (req.path.includes('employer')) target = path.join(uploadRoot, 'employers');
    ensureDir(target);
    cb(null, target);
  },
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/\.\.+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});
const upload = multer({ storage });

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    message: 'QSE server is running',
    port: PORT
  });
});

app.get('/api/auth/csrf-token', (req, res) => {
  res.json({ ok: true, csrfToken: req.session.csrfToken });
});

const loginRateLimit = rateLimit(15 * 60 * 1000, 20);

/* auth */
app.post('/api/auth/login', loginRateLimit, async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '').trim();
  const users = readJson(usersFile, []);
  const user = users.find((u) => String(u.email).toLowerCase() === email);

  if (!user || !user.passwordHash) {
    return res.status(401).json({ ok: false, message: 'Invalid email or password' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ ok: false, message: 'Invalid email or password' });
  }

  req.session.user = sanitizeUser(user);
  res.json({ ok: true, message: 'Login successful', user: req.session.user });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true, message: 'Logged out' }));
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    ok: true,
    authenticated: !!(req.session && req.session.user),
    user: req.session?.user || null
  });
});

app.post('/api/auth/register', requireAuth, requireRole(['admin']), async (req, res) => {
  const required = ['name', 'email', 'password', 'role'];
  const missing = required.filter((k) => !String(req.body?.[k] || '').trim());
  if (missing.length) {
    return res.status(400).json({ ok: false, message: 'Missing required fields', missing });
  }

  const users = readJson(usersFile, []);
  const email = String(req.body.email).trim().toLowerCase();
  if (users.find((u) => String(u.email).toLowerCase() === email)) {
    return res.status(409).json({ ok: false, message: 'User already exists' });
  }

  const user = {
    id: Date.now(),
    name: req.body.name,
    email,
    passwordHash: await bcrypt.hash(String(req.body.password), 10),
    role: req.body.role,
    createdAt: new Date().toISOString()
  };

  users.push(user);
  writeJson(usersFile, users);

  res.status(201).json({
    ok: true,
    message: 'User created',
    user: sanitizeUser(user)
  });
});

app.get('/api/admin/users', requireAuth, requireRole(['admin', 'staff']), (_req, res) => {
  res.json({ ok: true, users: readJson(usersFile, []).map(sanitizeUser) });
});

app.put('/api/admin/users/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  const users = readJson(usersFile, []);
  const index = users.findIndex((u) => String(u.id) === String(req.params.id));
  if (index === -1) return res.status(404).json({ ok: false, message: 'User not found' });

  users[index].name = req.body.name ?? users[index].name;
  users[index].email = req.body.email ? String(req.body.email).toLowerCase() : users[index].email;
  users[index].role = req.body.role ?? users[index].role;
  if (req.body.password && String(req.body.password).trim()) {
    users[index].passwordHash = await bcrypt.hash(String(req.body.password), 10);
  }
  users[index].updatedAt = new Date().toISOString();

  writeJson(usersFile, users);
  res.json({ ok: true, message: 'User updated', user: sanitizeUser(users[index]) });
});

app.delete('/api/admin/users/:id', requireAuth, requireRole(['admin']), (req, res) => {
  if (String(req.session.user.id) === String(req.params.id)) {
    return res.status(400).json({ ok: false, message: 'Cannot delete the active user' });
  }
  const ok = deleteById(usersFile, req.params.id);
  if (!ok) return res.status(404).json({ ok: false, message: 'User not found' });
  res.json({ ok: true, message: 'User deleted' });
});

/* sculptify */
app.get('/api/sculptify/providers', (_req, res) => {
  res.json({
    ok: true,
    providers: [
      { id: 1, name: 'Ava Brooks', specialty: 'Body Sculpting', mode: 'In-Person' },
      { id: 2, name: 'Maya Reed', specialty: 'Massage Therapy', mode: 'Virtual + In-Person' },
      { id: 3, name: 'Noah Lane', specialty: 'Reiki / Acupressure', mode: 'Virtual' }
    ]
  });
});

app.get('/api/sculptify/bookings', (_req, res) => {
  res.json({ ok: true, bookings: readJson(path.join(dataDir, 'sculptify-bookings.json'), []) });
});

app.post('/api/sculptify/bookings', (req, res) => {
  const required = ['fullName', 'email', 'service', 'sessionType', 'date'];
  const missing = required.filter((k) => !String(req.body?.[k] || '').trim());
  if (missing.length) return res.status(400).json({ ok: false, message: 'Missing required fields', missing });

  const booking = appendJson(path.join(dataDir, 'sculptify-bookings.json'), {
    id: Date.now(),
    fullName: req.body.fullName,
    email: req.body.email,
    service: req.body.service,
    sessionType: req.body.sessionType,
    date: req.body.date,
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ ok: true, message: 'Booking request received', booking });
});

app.get('/api/sculptify/onboarding', (_req, res) => {
  res.json({ ok: true, onboarding: readJson(path.join(dataDir, 'sculptify-onboarding.json'), []) });
});

app.post('/api/sculptify/onboarding', (req, res) => {
  const required = ['fullName', 'email', 'phone', 'serviceSpecialty'];
  const missing = required.filter((k) => !String(req.body?.[k] || '').trim());
  if (missing.length) return res.status(400).json({ ok: false, message: 'Missing required fields', missing });

  const submission = appendJson(path.join(dataDir, 'sculptify-onboarding.json'), {
    id: Date.now(),
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    serviceSpecialty: req.body.serviceSpecialty,
    licenseNumber: req.body.licenseNumber || '',
    insuranceProvider: req.body.insuranceProvider || '',
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ ok: true, message: 'Therapist onboarding received', submission });
});

app.post('/api/uploads/therapist-document', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, message: 'No file uploaded' });

  const row = appendJson(path.join(dataDir, 'therapist-uploads.json'), {
    id: Date.now(),
    originalName: req.file.originalname,
    fileName: req.file.filename,
    path: `/uploads/therapists/${req.file.filename}`,
    size: req.file.size,
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ ok: true, message: 'Therapist document uploaded', file: row });
});

app.get('/api/sculptify-admin/dashboard', requireAuth, requireRole(['admin', 'staff', 'viewer']), (_req, res) => {
  res.json({
    ok: true,
    metrics: {
      providers: 3,
      bookings: readJson(path.join(dataDir, 'sculptify-bookings.json'), []).length,
      onboarding: readJson(path.join(dataDir, 'sculptify-onboarding.json'), []).length,
      uploads: readJson(path.join(dataDir, 'therapist-uploads.json'), []).length
    }
  });
});

app.get('/api/admin/sculptify/bookings', requireAuth, requireRole(['admin', 'staff', 'viewer']), (req, res) => {
  const rows = readJson(path.join(dataDir, 'sculptify-bookings.json'), []);
  res.json({ ok: true, rows: findByQuery(rows, req.query.q, ['fullName', 'email', 'service', 'sessionType', 'date']) });
});

app.get('/api/admin/sculptify/onboarding', requireAuth, requireRole(['admin', 'staff', 'viewer']), (req, res) => {
  const rows = readJson(path.join(dataDir, 'sculptify-onboarding.json'), []);
  res.json({ ok: true, rows: findByQuery(rows, req.query.q, ['fullName', 'email', 'phone', 'serviceSpecialty']) });
});

app.put('/api/admin/sculptify/bookings/:id', requireAuth, requireRole(['admin', 'staff']), (req, res) => {
  const row = updateById(path.join(dataDir, 'sculptify-bookings.json'), req.params.id, req.body);
  if (!row) return res.status(404).json({ ok: false, message: 'Booking not found' });
  res.json({ ok: true, message: 'Booking updated', row });
});

app.delete('/api/admin/sculptify/bookings/:id', requireAuth, requireRole(['admin']), (req, res) => {
  const ok = deleteById(path.join(dataDir, 'sculptify-bookings.json'), req.params.id);
  if (!ok) return res.status(404).json({ ok: false, message: 'Booking not found' });
  res.json({ ok: true, message: 'Booking deleted' });
});

app.put('/api/admin/sculptify/onboarding/:id', requireAuth, requireRole(['admin', 'staff']), (req, res) => {
  const row = updateById(path.join(dataDir, 'sculptify-onboarding.json'), req.params.id, req.body);
  if (!row) return res.status(404).json({ ok: false, message: 'Onboarding record not found' });
  res.json({ ok: true, message: 'Onboarding updated', row });
});

app.delete('/api/admin/sculptify/onboarding/:id', requireAuth, requireRole(['admin']), (req, res) => {
  const ok = deleteById(path.join(dataDir, 'sculptify-onboarding.json'), req.params.id);
  if (!ok) return res.status(404).json({ ok: false, message: 'Onboarding record not found' });
  res.json({ ok: true, message: 'Onboarding deleted' });
});

/* march lewis */
app.get('/api/march-lewis/jobs', (_req, res) => {
  res.json({
    ok: true,
    jobs: [
      { id: 1, title: 'Medical Courier', type: 'Full-Time', location: 'Houston, TX' },
      { id: 2, title: 'Warehouse Associate', type: 'Part-Time', location: 'Nashville, TN' },
      { id: 3, title: 'Logistics Coordinator', type: 'Contract', location: 'Remote' }
    ]
  });
});

app.get('/api/march-lewis/employers', (_req, res) => {
  res.json({ ok: true, employers: readJson(path.join(dataDir, 'march-lewis-employers.json'), []) });
});

app.post('/api/march-lewis/employers', (req, res) => {
  const required = ['companyName', 'hiringManager', 'email', 'positionType'];
  const missing = required.filter((k) => !String(req.body?.[k] || '').trim());
  if (missing.length) return res.status(400).json({ ok: false, message: 'Missing required fields', missing });

  const employer = appendJson(path.join(dataDir, 'march-lewis-employers.json'), {
    id: Date.now(),
    companyName: req.body.companyName,
    hiringManager: req.body.hiringManager,
    email: req.body.email,
    positionType: req.body.positionType,
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ ok: true, message: 'Employer intake received', employer });
});

app.get('/api/march-lewis/candidates', (_req, res) => {
  res.json({ ok: true, candidates: readJson(path.join(dataDir, 'march-lewis-candidates.json'), []) });
});

app.post('/api/march-lewis/candidates', (req, res) => {
  const required = ['fullName', 'email', 'phone', 'workAuthorization', 'availability'];
  const missing = required.filter((k) => !String(req.body?.[k] || '').trim());
  if (missing.length) return res.status(400).json({ ok: false, message: 'Missing required fields', missing });

  const candidate = appendJson(path.join(dataDir, 'march-lewis-candidates.json'), {
    id: Date.now(),
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    workAuthorization: req.body.workAuthorization,
    availability: req.body.availability,
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ ok: true, message: 'Candidate onboarding received', candidate });
});

app.post('/api/uploads/candidate-document', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, message: 'No file uploaded' });

  const row = appendJson(path.join(dataDir, 'candidate-uploads.json'), {
    id: Date.now(),
    originalName: req.file.originalname,
    fileName: req.file.filename,
    path: `/uploads/candidates/${req.file.filename}`,
    size: req.file.size,
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ ok: true, message: 'Candidate document uploaded', file: row });
});

app.post('/api/uploads/employer-document', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, message: 'No file uploaded' });

  const row = appendJson(path.join(dataDir, 'employer-uploads.json'), {
    id: Date.now(),
    originalName: req.file.originalname,
    fileName: req.file.filename,
    path: `/uploads/employers/${req.file.filename}`,
    size: req.file.size,
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ ok: true, message: 'Employer document uploaded', file: row });
});

app.get('/api/march-lewis-admin/dashboard', requireAuth, requireRole(['admin', 'staff', 'viewer']), (_req, res) => {
  res.json({
    ok: true,
    metrics: {
      jobs: 3,
      employers: readJson(path.join(dataDir, 'march-lewis-employers.json'), []).length,
      candidates: readJson(path.join(dataDir, 'march-lewis-candidates.json'), []).length,
      candidateUploads: readJson(path.join(dataDir, 'candidate-uploads.json'), []).length,
      employerUploads: readJson(path.join(dataDir, 'employer-uploads.json'), []).length
    }
  });
});

app.get('/api/admin/march-lewis/employers', requireAuth, requireRole(['admin', 'staff', 'viewer']), (req, res) => {
  const rows = readJson(path.join(dataDir, 'march-lewis-employers.json'), []);
  res.json({ ok: true, rows: findByQuery(rows, req.query.q, ['companyName', 'hiringManager', 'email', 'positionType']) });
});

app.get('/api/admin/march-lewis/candidates', requireAuth, requireRole(['admin', 'staff', 'viewer']), (req, res) => {
  const rows = readJson(path.join(dataDir, 'march-lewis-candidates.json'), []);
  res.json({ ok: true, rows: findByQuery(rows, req.query.q, ['fullName', 'email', 'phone', 'workAuthorization', 'availability']) });
});

app.put('/api/admin/march-lewis/employers/:id', requireAuth, requireRole(['admin', 'staff']), (req, res) => {
  const row = updateById(path.join(dataDir, 'march-lewis-employers.json'), req.params.id, req.body);
  if (!row) return res.status(404).json({ ok: false, message: 'Employer not found' });
  res.json({ ok: true, message: 'Employer updated', row });
});

app.delete('/api/admin/march-lewis/employers/:id', requireAuth, requireRole(['admin']), (req, res) => {
  const ok = deleteById(path.join(dataDir, 'march-lewis-employers.json'), req.params.id);
  if (!ok) return res.status(404).json({ ok: false, message: 'Employer not found' });
  res.json({ ok: true, message: 'Employer deleted' });
});

app.put('/api/admin/march-lewis/candidates/:id', requireAuth, requireRole(['admin', 'staff']), (req, res) => {
  const row = updateById(path.join(dataDir, 'march-lewis-candidates.json'), req.params.id, req.body);
  if (!row) return res.status(404).json({ ok: false, message: 'Candidate not found' });
  res.json({ ok: true, message: 'Candidate updated', row });
});

app.delete('/api/admin/march-lewis/candidates/:id', requireAuth, requireRole(['admin']), (req, res) => {
  const ok = deleteById(path.join(dataDir, 'march-lewis-candidates.json'), req.params.id);
  if (!ok) return res.status(404).json({ ok: false, message: 'Candidate not found' });
  res.json({ ok: true, message: 'Candidate deleted' });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err && err.stack ? err.stack : err);
  res.status(500).json({ ok: false, message: 'Server error' });
});

ensureAdminUser().then(() => {
  app.listen(PORT, () => {
    console.log(`QSE server listening on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize admin user:', err);
  process.exit(1);
});
