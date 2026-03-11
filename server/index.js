require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const session = require('express-session');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const { migrate } = require('./db/migrate');
const { get, all, run, dbPath } = require('./db/sqlite');
const { writeAudit } = require('./lib/audit');

const app = express();
const PORT = process.env.PORT || 5000;
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET && process.env.NODE_ENV === 'production') {
  console.error('SESSION_SECRET must be set in production');
  process.exit(1);
}

const sculptifyDir = path.join(process.cwd(), 'apps', 'sculptify-web', 'public');
const marchDir = path.join(process.cwd(), 'apps', 'march-lewis-web', 'public');
const uploadRoot = path.join(process.cwd(), 'uploads');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
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

function sanitizeUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at || null
  };
}

function buildLikeQuery(q) {
  return `%${String(q || '').trim().toLowerCase()}%`;
}

function pageParams(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(query.pageSize || 10), 1), 50);
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

ensureDir(path.join(uploadRoot, 'therapists'));
ensureDir(path.join(uploadRoot, 'candidates'));
ensureDir(path.join(uploadRoot, 'employers'));

const staticRateLimit = rateLimit({ windowMs: 60 * 1000, max: 120 });
const apiRateLimit = rateLimit({ windowMs: 60 * 1000, max: 60 });
const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  name: 'qse.sid',
  secret: SESSION_SECRET || 'qse-dev-secret-change-me-now',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
    secure: String(process.env.COOKIE_SECURE || 'false') === 'true',
    maxAge: 1000 * 60 * 60 * 8
  }
}));

/* CSRF protection: reject cross-origin state-changing requests */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
app.use((req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();
  const origin = req.headers.origin || req.headers.referer;
  if (!origin) return next();
  const appBase = process.env.APP_BASE_URL || `${req.protocol}://${req.hostname}`;
  if (!origin.startsWith(appBase)) {
    return res.status(403).json({ ok: false, message: 'CSRF check failed' });
  }
  next();
});

app.use('/sculptify', express.static(sculptifyDir));
app.use('/march-lewis', express.static(marchDir));
app.use('/uploads', express.static(uploadRoot));
app.use('/api/auth', authRateLimit);
app.use('/api/', apiRateLimit);
const UPLOAD_CATEGORIES = { therapists: 'therapists', candidates: 'candidates', employers: 'employers' };

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const cat = UPLOAD_CATEGORIES[req.query.category] || 'therapists';
    const target = path.join(uploadRoot, cat);
    ensureDir(target);
    cb(null, target);
  },
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});
const upload = multer({ storage });

async function pagedQuery(baseSql, countSql, params, query) {
  const { page, pageSize, offset } = pageParams(query);
  const rows = await all(`${baseSql} LIMIT ? OFFSET ?`, [...params, pageSize, offset]);
  const totalRow = await get(countSql, params);
  return {
    rows,
    pagination: {
      page,
      pageSize,
      total: totalRow.count,
      totalPages: Math.max(Math.ceil(totalRow.count / pageSize), 1)
    }
  };
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    message: 'QSE server is running',
    port: PORT,
    database: dbPath,
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

/* auth */
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '').trim();
    const user = await get(`SELECT * FROM users WHERE lower(email) = ?`, [email]);

    if (!user) return res.status(401).json({ ok: false, message: 'Invalid email or password' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ ok: false, message: 'Invalid email or password' });

    req.session.user = sanitizeUser(user);

    await writeAudit({
      actorEmail: user.email,
      action: 'login',
      entityType: 'user',
      entityId: user.id,
      details: { role: user.role }
    });

    res.json({ ok: true, message: 'Login successful', user: req.session.user });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/logout', async (req, res) => {
  const actorEmail = req.session?.user?.email || null;
  if (actorEmail) {
    await writeAudit({
      actorEmail,
      action: 'logout',
      entityType: 'user',
      entityId: req.session?.user?.id || null
    });
  }
  req.session.destroy(() => res.json({ ok: true, message: 'Logged out' }));
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    ok: true,
    authenticated: !!req.session?.user,
    user: req.session?.user || null
  });
});

app.post('/api/auth/register', requireAuth, requireRole(['admin']), async (req, res, next) => {
  try {
    const missing = ['name', 'email', 'password', 'role'].filter((k) => !String(req.body?.[k] || '').trim());
    if (missing.length) return res.status(400).json({ ok: false, message: 'Missing required fields', missing });

    const email = String(req.body.email).trim().toLowerCase();
    const exists = await get(`SELECT id FROM users WHERE lower(email)=?`, [email]);
    if (exists) return res.status(409).json({ ok: false, message: 'User already exists' });

    const passwordHash = await bcrypt.hash(String(req.body.password), 10);
    const result = await run(
      `INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)`,
      [String(req.body.name).trim(), email, passwordHash, String(req.body.role).trim(), new Date().toISOString()]
    );

    await writeAudit({
      actorEmail: req.session.user.email,
      action: 'create',
      entityType: 'user',
      entityId: result.lastID,
      details: { email, role: req.body.role }
    });

    const created = await get(`SELECT * FROM users WHERE id = ?`, [result.lastID]);
    res.status(201).json({ ok: true, message: 'User created', user: sanitizeUser(created) });
  } catch (error) {
    next(error);
  }
});

/* admin */
app.get('/api/admin/summary', requireAuth, requireRole(['admin', 'staff', 'viewer']), async (_req, res, next) => {
  try {
    const users = await get(`SELECT COUNT(*) AS count FROM users`);
    const bookings = await get(`SELECT COUNT(*) AS count FROM sculptify_bookings`);
    const onboarding = await get(`SELECT COUNT(*) AS count FROM sculptify_onboarding`);
    const employers = await get(`SELECT COUNT(*) AS count FROM march_lewis_employers`);
    const candidates = await get(`SELECT COUNT(*) AS count FROM march_lewis_candidates`);
    const uploads = await get(`SELECT COUNT(*) AS count FROM uploads`);
    const auditLogs = await get(`SELECT COUNT(*) AS count FROM audit_logs`);

    res.json({
      ok: true,
      summary: {
        sculptify: { providers: 3, bookings: bookings.count, onboarding: onboarding.count },
        marchLewis: { jobs: 3, employers: employers.count, candidates: candidates.count },
        platform: { users: users.count, uploads: uploads.count, auditLogs: auditLogs.count }
      }
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/audit-logs', requireAuth, requireRole(['admin', 'staff']), async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    let response;
    if (!q) {
      response = await pagedQuery(
        `SELECT * FROM audit_logs ORDER BY id DESC`,
        `SELECT COUNT(*) AS count FROM audit_logs`,
        [],
        req.query
      );
    } else {
      const like = buildLikeQuery(q);
      response = await pagedQuery(
        `SELECT * FROM audit_logs
         WHERE lower(coalesce(actor_email,'')) LIKE ?
            OR lower(action) LIKE ?
            OR lower(entity_type) LIKE ?
            OR lower(coalesce(entity_id,'')) LIKE ?
         ORDER BY id DESC`,
        `SELECT COUNT(*) AS count FROM audit_logs
         WHERE lower(coalesce(actor_email,'')) LIKE ?
            OR lower(action) LIKE ?
            OR lower(entity_type) LIKE ?
            OR lower(coalesce(entity_id,'')) LIKE ?`,
        [like, like, like, like],
        req.query
      );
    }
    res.json({ ok: true, ...response });
  } catch (error) {
    next(error);
  }
});

/* public product endpoints */
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

/* create flows */
app.post('/api/sculptify/bookings', async (req, res, next) => {
  try {
    const missing = ['fullName', 'email', 'service', 'sessionType', 'date'].filter((k) => !String(req.body?.[k] || '').trim());
    if (missing.length) return res.status(400).json({ ok: false, message: 'Missing required fields', missing });

    const result = await run(
      `INSERT INTO sculptify_bookings (full_name, email, service, session_type, date, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.body.fullName, req.body.email, req.body.service, req.body.sessionType, req.body.date, new Date().toISOString()]
    );

    await writeAudit({
      actorEmail: req.session?.user?.email || null,
      action: 'create',
      entityType: 'sculptify_booking',
      entityId: result.lastID,
      details: { email: req.body.email, service: req.body.service }
    });

    const booking = await get(`SELECT * FROM sculptify_bookings WHERE id = ?`, [result.lastID]);
    res.status(201).json({ ok: true, message: 'Booking request received', booking });
  } catch (error) {
    next(error);
  }
});

app.post('/api/sculptify/onboarding', async (req, res, next) => {
  try {
    const missing = ['fullName', 'email', 'phone', 'serviceSpecialty'].filter((k) => !String(req.body?.[k] || '').trim());
    if (missing.length) return res.status(400).json({ ok: false, message: 'Missing required fields', missing });

    const result = await run(
      `INSERT INTO sculptify_onboarding (full_name, email, phone, service_specialty, license_number, insurance_provider, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.body.fullName,
        req.body.email,
        req.body.phone,
        req.body.serviceSpecialty,
        req.body.licenseNumber || '',
        req.body.insuranceProvider || '',
        new Date().toISOString()
      ]
    );

    await writeAudit({
      actorEmail: req.session?.user?.email || null,
      action: 'create',
      entityType: 'sculptify_onboarding',
      entityId: result.lastID,
      details: { email: req.body.email, specialty: req.body.serviceSpecialty }
    });

    const submission = await get(`SELECT * FROM sculptify_onboarding WHERE id = ?`, [result.lastID]);
    res.status(201).json({ ok: true, message: 'Therapist onboarding received', submission });
  } catch (error) {
    next(error);
  }
});

app.post('/api/march-lewis/employers', async (req, res, next) => {
  try {
    const missing = ['companyName', 'hiringManager', 'email', 'positionType'].filter((k) => !String(req.body?.[k] || '').trim());
    if (missing.length) return res.status(400).json({ ok: false, message: 'Missing required fields', missing });

    const result = await run(
      `INSERT INTO march_lewis_employers (company_name, hiring_manager, email, position_type, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [req.body.companyName, req.body.hiringManager, req.body.email, req.body.positionType, new Date().toISOString()]
    );

    await writeAudit({
      actorEmail: req.session?.user?.email || null,
      action: 'create',
      entityType: 'march_lewis_employer',
      entityId: result.lastID,
      details: { email: req.body.email, company: req.body.companyName }
    });

    const employer = await get(`SELECT * FROM march_lewis_employers WHERE id = ?`, [result.lastID]);
    res.status(201).json({ ok: true, message: 'Employer intake received', employer });
  } catch (error) {
    next(error);
  }
});

app.post('/api/march-lewis/candidates', async (req, res, next) => {
  try {
    const missing = ['fullName', 'email', 'phone', 'workAuthorization', 'availability'].filter((k) => !String(req.body?.[k] || '').trim());
    if (missing.length) return res.status(400).json({ ok: false, message: 'Missing required fields', missing });

    const result = await run(
      `INSERT INTO march_lewis_candidates (full_name, email, phone, work_authorization, availability, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.body.fullName, req.body.email, req.body.phone, req.body.workAuthorization, req.body.availability, new Date().toISOString()]
    );

    await writeAudit({
      actorEmail: req.session?.user?.email || null,
      action: 'create',
      entityType: 'march_lewis_candidate',
      entityId: result.lastID,
      details: { email: req.body.email }
    });

    const candidate = await get(`SELECT * FROM march_lewis_candidates WHERE id = ?`, [result.lastID]);
    res.status(201).json({ ok: true, message: 'Candidate onboarding received', candidate });
  } catch (error) {
    next(error);
  }
});

/* file upload */
app.post('/api/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, message: 'No file uploaded' });

    const category = UPLOAD_CATEGORIES[req.query.category] || 'therapists';
    await run(
      `INSERT INTO uploads (category, original_name, file_name, file_path, file_size, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [category, req.file.originalname, req.file.filename, req.file.path, req.file.size, new Date().toISOString()]
    );

    const urlPath = `/uploads/${category}/${req.file.filename}`;
    res.json({ ok: true, url: urlPath, filename: req.file.originalname });
  } catch (error) {
    next(error);
  }
});

/* SPA fallbacks */
app.get('/sculptify/*', staticRateLimit, (_req, res) => res.sendFile(path.join(sculptifyDir, 'index.html')));
app.get('/march-lewis/*', staticRateLimit, (_req, res) => res.sendFile(path.join(marchDir, 'index.html')));

/* error handler */
app.use((err, _req, res, _next) => {
  console.error(err && err.stack ? err.stack : err);
  res.status(500).json({ ok: false, message: 'Server error' });
});

migrate()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`QSE server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to run migrations:', err);
    process.exit(1);
  });
