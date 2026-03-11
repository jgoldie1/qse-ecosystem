#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(pwd)"
SERVER="$ROOT/server"

mkdir -p "$SERVER/middleware" "$ROOT/apps/qse-home/public"

# ── Security middleware (helmet + cors) ──────────────────────────────────────
cat > "$SERVER/middleware/security.js" <<'JS'
const helmet = require('helmet');
const cors = require('cors');

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  }
});

const corsMiddleware = cors({
  origin: function (origin, callback) {
    // In production with an allow-list, require the origin to be explicitly listed.
    // Undefined origin (same-origin or non-browser requests) is only allowed in
    // development or when no allow-list has been configured.
    if (IS_PRODUCTION && ALLOWED_ORIGINS.length) {
      if (origin && ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    }
    // Development / no allow-list: permit everything (including same-origin).
    if (!ALLOWED_ORIGINS.length || !origin || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
});

module.exports = { helmetMiddleware, corsMiddleware };
JS

# ── Rate-limit middleware ─────────────────────────────────────────────────────
cat > "$SERVER/middleware/rateLimit.js" <<'JS'
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: 'Too many requests, please try again later.' }
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: 'Too many upload requests, please try again later.' }
});

const staticLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: 'Too many requests, please try again later.' }
});

module.exports = { authLimiter, uploadLimiter, staticLimiter };
JS

# ── QSE Ecosystem home portal ─────────────────────────────────────────────────
cat > "$ROOT/apps/qse-home/public/index.html" <<'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>QSE Ecosystem</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: #0f0f0f; color: #f0f0f0; min-height: 100vh; }
    a { color: inherit; text-decoration: none; }

    .header { background: #1a1a2e; border-bottom: 1px solid #2a2a4a; padding: 18px 0; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
    .header .container { display: flex; align-items: center; justify-content: space-between; }
    .logo { font-size: 1.5rem; font-weight: 800; letter-spacing: 1px;
            background: linear-gradient(90deg, #7c3aed, #06b6d4); -webkit-background-clip: text;
            -webkit-text-fill-color: transparent; }
    .nav { display: flex; gap: 24px; font-size: 0.9rem; opacity: 0.8; }

    .hero { text-align: center; padding: 90px 24px 60px; }
    .hero h1 { font-size: 3rem; font-weight: 900; margin-bottom: 16px;
               background: linear-gradient(135deg, #7c3aed, #06b6d4);
               -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero p { font-size: 1.2rem; opacity: 0.7; max-width: 560px; margin: 0 auto 36px; }

    .btn { display: inline-block; padding: 12px 28px; border-radius: 8px; font-weight: 700;
           font-size: 0.95rem; transition: opacity 0.2s; }
    .btn:hover { opacity: 0.85; }
    .btn-primary { background: linear-gradient(90deg, #7c3aed, #06b6d4); color: #fff; }
    .btn-outline { border: 2px solid #7c3aed; color: #a78bfa; }

    .apps { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 28px; padding: 20px 0 80px; }
    .app-card { background: #1a1a2e; border: 1px solid #2a2a4a; border-radius: 16px;
                padding: 36px 32px; transition: transform 0.2s, border-color 0.2s; }
    .app-card:hover { transform: translateY(-4px); border-color: #7c3aed; }
    .app-card .icon { font-size: 3rem; margin-bottom: 16px; }
    .app-card h2 { font-size: 1.5rem; margin-bottom: 10px; }
    .app-card p { opacity: 0.65; line-height: 1.6; margin-bottom: 24px; }

    .features { background: #141428; padding: 70px 0; }
    .features h2 { text-align: center; font-size: 2rem; margin-bottom: 48px; opacity: 0.9; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; }
    .feature { background: #1a1a2e; border-radius: 12px; padding: 24px; text-align: center; }
    .feature .icon { font-size: 2rem; margin-bottom: 12px; }
    .feature h3 { font-size: 1rem; margin-bottom: 8px; }
    .feature p { font-size: 0.85rem; opacity: 0.6; }

    .health { display: inline-flex; align-items: center; gap: 8px; font-size: 0.85rem;
              padding: 6px 14px; border-radius: 20px; background: #1a1a2e; border: 1px solid #2a2a4a; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; }

    .footer { background: #1a1a2e; border-top: 1px solid #2a2a4a; padding: 28px 0; text-align: center;
              font-size: 0.85rem; opacity: 0.5; }
  </style>
</head>
<body>
  <header class="header">
    <div class="container">
      <div class="logo">QSE</div>
      <nav class="nav">
        <a href="/sculptify">Sculptify</a>
        <a href="/march-lewis">March &amp; Lewis</a>
        <span id="health-badge" class="health"><span class="dot"></span>Live</span>
      </nav>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="container">
        <h1>QSE Ecosystem</h1>
        <p>A unified platform powering Sculptify and March &amp; Lewis — beauty, wellness, and career services under one roof.</p>
        <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
          <a href="/sculptify" class="btn btn-primary">Open Sculptify</a>
          <a href="/march-lewis" class="btn btn-outline">Open March &amp; Lewis</a>
        </div>
      </div>
    </section>

    <section class="container">
      <div class="apps">
        <div class="app-card">
          <div class="icon">💆</div>
          <h2>Sculptify</h2>
          <p>Premium beauty, wellness &amp; training programs. Book appointments, access coaching, and connect with wellness professionals.</p>
          <a href="/sculptify" class="btn btn-primary">Launch App</a>
        </div>
        <div class="app-card">
          <div class="icon">💼</div>
          <h2>March &amp; Lewis</h2>
          <p>Career staffing &amp; workforce solutions. Connecting top talent with great employers through smart, personalised placement.</p>
          <a href="/march-lewis" class="btn btn-primary">Launch App</a>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <h2>Platform Capabilities</h2>
        <div class="features-grid">
          <div class="feature"><div class="icon">🤖</div><h3>AI Coach</h3><p>Personalised guidance for wellness and career goals.</p></div>
          <div class="feature"><div class="icon">🏅</div><h3>Rewards</h3><p>Earn points for bookings, training, and referrals.</p></div>
          <div class="feature"><div class="icon">🎓</div><h3>Training</h3><p>Structured programs across health and professional development.</p></div>
          <div class="feature"><div class="icon">💳</div><h3>Memberships</h3><p>Subscription tiers with exclusive access and discounts.</p></div>
          <div class="feature"><div class="icon">🔐</div><h3>Secure Auth</h3><p>JWT-based authentication with bcrypt password hashing.</p></div>
          <div class="feature"><div class="icon">☁️</div><h3>Deploy Ready</h3><p>Production hardened with Helmet, CORS, rate limiting, and compression.</p></div>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      &copy; 2025 QSE Ecosystem &mdash; Sculptify &amp; March and Lewis
    </div>
  </footer>

  <script>
    fetch('/health')
      .then(r => r.json())
      .then(d => {
        const badge = document.getElementById('health-badge');
        if (!d.ok) { badge.querySelector('.dot').style.background = '#ef4444'; }
      })
      .catch(() => {
        const dot = document.getElementById('health-badge').querySelector('.dot');
        if (dot) dot.style.background = '#ef4444';
      });
  </script>
</body>
</html>
HTML

# ── Procfile (Heroku / Railway) ───────────────────────────────────────────────
cat > "$ROOT/Procfile" <<'PROC'
web: node server/index.js
PROC

# ── render.yaml (Render.com) ──────────────────────────────────────────────────
cat > "$ROOT/render.yaml" <<'YAML'
services:
  - type: web
    name: qse-ecosystem
    env: node
    buildCommand: npm install
    startCommand: node server/index.js
    envVars:
      - key: PORT
        generateValue: true
      - key: JWT_SECRET
        generateValue: true
      - key: SESSION_SECRET
        generateValue: true
      - key: NODE_ENV
        value: production
      - key: CORS_ORIGINS
        value: ""
YAML

# ── .env.example ─────────────────────────────────────────────────────────────
cat > "$ROOT/.env.example" <<'ENV'
PORT=5000
NODE_ENV=development
SESSION_SECRET=change-me-in-production
JWT_SECRET=change-me-in-production
CORS_ORIGINS=
ENV

# ── Patch server/index.js ────────────────────────────────────────────────────

# 1. Inject require statements after multer if not already present
if ! grep -q "require('morgan')" "$SERVER/index.js"; then
  sed -i "s|const multer = require('multer');|const multer = require('multer');\nconst morgan = require('morgan');\nconst compression = require('compression');\nconst { helmetMiddleware, corsMiddleware } = require('./middleware/security');\nconst { authLimiter, uploadLimiter, staticLimiter } = require('./middleware/rateLimit');|" "$SERVER/index.js"
fi

# 2. Inject security + logging middleware before express.json() if not already present
if ! grep -q 'app.use(helmetMiddleware)' "$SERVER/index.js"; then
  sed -i "s|app.use(express.json());|app.use(helmetMiddleware);\napp.use(corsMiddleware);\napp.use(compression());\napp.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));\napp.use(express.json());|" "$SERVER/index.js"
fi

# 3. Serve QSE home portal as a rate-limited GET / route before the sub-app static routes
if ! grep -q 'qse-home' "$SERVER/index.js"; then
  sed -i "s|// Static public apps|// QSE home portal\napp.get('/', staticLimiter, (_req, res) => res.sendFile(path.join(__dirname, '..', 'apps', 'qse-home', 'public', 'index.html')));\n\n// Static public apps|" "$SERVER/index.js"
fi

# 4. Add rate limiter to auth route
if ! grep -q 'authLimiter, require' "$SERVER/index.js"; then
  sed -i 's|app.use("/api/auth", require("./routes/auth"));|app.use("/api/auth", authLimiter, require("./routes/auth"));|' "$SERVER/index.js"
fi

# 5. Add rate limiter to upload endpoint
if ! grep -q 'uploadLimiter' "$SERVER/index.js"; then
  sed -i "s|app.post('/api/upload', upload.single('file'),|app.post('/api/upload', uploadLimiter, upload.single('file'),|" "$SERVER/index.js"
fi

# ── Install production dependencies ──────────────────────────────────────────
echo "Installing production dependencies..."
npm install helmet cors express-rate-limit compression morgan bcryptjs jsonwebtoken

echo ""
echo "✅  Part 9 deploy-ready build complete."
echo ""
echo "  npm run dev          → start development server"
echo "  node server/index.js → start production server"
echo ""
echo "  http://localhost:5000           QSE home"
echo "  http://localhost:5000/sculptify Sculptify"
echo "  http://localhost:5000/march-lewis March & Lewis"
