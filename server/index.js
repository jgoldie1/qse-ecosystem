const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const { migrate } = require('./db/migrate');
const { run, all, get, dbPath } = require('./db/sqlite');
const { writeAudit } = require('./lib/audit');
const { requireAuth, requireRole } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const sculptifyDir = path.join(root, 'apps', 'sculptify-web', 'public');
const marchDir = path.join(root, 'apps', 'march-lewis-web', 'public');
const uploadRoot = path.join(root, 'uploads');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir(path.join(uploadRoot, 'therapists'));
ensureDir(path.join(uploadRoot, 'candidates'));
ensureDir(path.join(uploadRoot, 'employers'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  name: 'qse.sid',
  secret: process.env.SESSION_SECRET || 'qse-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 8
  }
}));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: 'Too many login attempts, please try again later' }
});

// Static assets
app.use('/sculptify', express.static(sculptifyDir));
app.use('/march-lewis', express.static(marchDir));
app.use('/uploads', express.static(uploadRoot));
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

// SPA fallbacks for public apps
app.get('/sculptify/*', (_req, res) => res.sendFile(path.join(sculptifyDir, 'index.html')));
app.get('/march-lewis/*', (_req, res) => res.sendFile(path.join(marchDir, 'index.html')));

// File upload (multer)
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    let target = path.join(uploadRoot, 'therapists');
    if (req.path.includes('candidate')) target = path.join(uploadRoot, 'candidates');
    if (req.path.includes('employer')) target = path.join(uploadRoot, 'employers');
    ensureDir(target);
    cb(null, target);
  },
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});
const upload = multer({ storage });

// Routes
app.use('/api/auth', loginLimiter, require('./routes/auth'));
app.use('/api/sculptify', require('./routes/sculptify'));
app.use('/api/march-lewis', require('./routes/marchLewis'));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'QSE server is running', port: PORT, database: dbPath });
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, message: 'No file uploaded' });
    const category = req.body.category || 'general';
    const subDir = path.join(uploadRoot, category);
    ensureDir(subDir);
    const filePath = `/uploads/${category}/${req.file.filename}`;
    const result = await run(
      'INSERT INTO uploads (category, original_name, file_name, file_path, file_size, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [category, req.file.originalname, req.file.filename, filePath, req.file.size, new Date().toISOString()]
    );
    await writeAudit({
      actorEmail: req.session?.user?.email || null,
      action: 'upload',
      entityType: 'file',
      entityId: result.lastID,
      details: { category, fileName: req.file.filename }
    });
    res.json({ ok: true, url: filePath, filename: req.file.originalname });
  } catch (err) {
    next(err);
  }
});

// Admin API: users
app.get('/api/admin/users', requireAuth, requireRole(['admin', 'staff']), async (_req, res, next) => {
  try {
    const rows = await all('SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY id DESC');
    res.json({ ok: true, users: rows });
  } catch (err) {
    next(err);
  }
});

// Admin API: audit logs
app.get('/api/admin/audit-logs', requireAuth, requireRole(['admin', 'staff']), async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(1, Number(req.query.limit) || 50), 200);
    const rows = await all('SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?', [limit]);
    res.json({ ok: true, rows });
  } catch (err) {
    next(err);
  }
});

// Admin dashboard summary
app.get('/api/admin/summary', requireAuth, requireRole(['admin', 'staff', 'viewer']), async (_req, res, next) => {
  try {
    const [bookings, onboarding, employers, candidates, uploads] = await Promise.all([
      get('SELECT COUNT(*) AS count FROM sculptify_bookings'),
      get('SELECT COUNT(*) AS count FROM sculptify_onboarding'),
      get('SELECT COUNT(*) AS count FROM march_lewis_employers'),
      get('SELECT COUNT(*) AS count FROM march_lewis_candidates'),
      get('SELECT COUNT(*) AS count FROM uploads')
    ]);
    res.json({
      ok: true,
      summary: {
        bookings: bookings.count,
        onboarding: onboarding.count,
        employers: employers.count,
        candidates: candidates.count,
        uploads: uploads.count
      }
    });
  } catch (err) {
    next(err);
  }
});

// Login page
app.get('/login', loginLimiter, (_req, res) => {
  const loginPage = path.join(publicDir, 'login.html');
  if (fs.existsSync(loginPage)) return res.sendFile(loginPage);
  res.send(`<!DOCTYPE html><html><head><title>QSE Login</title></head><body>
    <h2>QSE Login</h2>
    <form method="POST" action="/api/auth/login" id="loginForm">
      <input name="email" type="email" placeholder="Email" required /><br/>
      <input name="password" type="password" placeholder="Password" required /><br/>
      <button type="submit">Login</button>
    </form>
    <script>
      document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target));
        const r = await fetch('/api/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });
        const j = await r.json();
        if (j.ok) location.href = '/admin';
        else alert(j.message);
      });
    </script>
  </body></html>`);
});

// Admin page
app.get('/admin', loginLimiter, requireAuth, (_req, res) => {
  const adminPage = path.join(publicDir, 'admin.html');
  if (fs.existsSync(adminPage)) return res.sendFile(adminPage);
  res.send(`<!DOCTYPE html><html><head><title>QSE Admin</title></head><body>
    <h2>QSE Admin Dashboard</h2>
    <div id="summary"></div>
    <script>
      fetch('/api/admin/summary').then(r=>r.json()).then(j=>{
        if(j.ok) document.getElementById('summary').innerHTML = JSON.stringify(j.summary, null, 2);
      });
    </script>
  </body></html>`);
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err && err.stack ? err.stack : err);
  res.status(500).json({ ok: false, message: 'Server error' });
});

// Boot: run migrations then start server
migrate()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
