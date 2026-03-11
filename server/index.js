const express = require('express');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static public apps
app.use('/sculptify', express.static(path.resolve(__dirname, '..', 'apps', 'sculptify-web', 'public')));
app.use('/march-lewis', express.static(path.resolve(__dirname, '..', 'apps', 'march-lewis-web', 'public')));

// /* SPA fallbacks for public apps */
app.get('/sculptify/*', (_req, res) => res.sendFile(path.join(__dirname, '..', 'apps', 'sculptify-web', 'public', 'index.html')));
app.get('/march-lewis/*', (_req, res) => res.sendFile(path.join(__dirname, '..', 'apps', 'march-lewis-web', 'public', 'index.html')));

// Uploads
const uploadDir = path.join(__dirname, 'uploads');
const upload = multer({ dest: uploadDir });
app.use('/uploads', express.static(uploadDir));

// Routes
app.use('/api/sculptify', require('./routes/sculptify'));
app.use('/api/march-lewis', require('./routes/marchLewis'));
app.use("/api/auth", require("./routes/auth"));

// Simple file upload endpoint used by public sites
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, message: 'No file uploaded' });
  const urlPath = `/uploads/${req.file.filename}`;
  res.json({ ok: true, url: urlPath, filename: req.file.originalname });
});

// Root landing page
app.get('/', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>QSE Ecosystem</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #f5f5f5; text-align: center; padding: 60px 20px; }
    h1 { font-size: 3rem; font-weight: 800; margin-bottom: 10px; }
    .subtitle { font-size: 1.2rem; color: #888; margin-bottom: 40px; }
    .apps { display: flex; justify-content: center; gap: 30px; flex-wrap: wrap; margin-bottom: 40px; }
    .card { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; padding: 30px 40px; text-decoration: none; color: #f5f5f5; transition: border-color 0.2s; }
    .card:hover { border-color: #6c63ff; }
    .card h2 { margin: 0 0 8px; font-size: 1.5rem; }
    .card span { color: #888; font-size: 0.95rem; }
    .nav-links { display: flex; justify-content: center; gap: 16px; }
    .btn { display: inline-block; padding: 10px 24px; border-radius: 8px; font-size: 0.95rem; font-weight: 600; text-decoration: none; transition: opacity 0.2s; }
    .btn-primary { background: #6c63ff; color: #fff; }
    .btn-outline { background: transparent; color: #6c63ff; border: 2px solid #6c63ff; }
    .btn:hover { opacity: 0.85; }
  </style>
</head>
<body>
  <h1>QSE Ecosystem</h1>
  <p class="subtitle">Your unified platform for Sculptify and March &amp; Lewis</p>
  <div class="apps">
    <a class="card" href="/sculptify">
      <h2>Sculptify</h2>
      <span>Beauty, wellness &amp; training platform</span>
    </a>
    <a class="card" href="/march-lewis">
      <h2>March &amp; Lewis</h2>
      <span>Career staffing &amp; workforce platform</span>
    </a>
  </div>
  <div class="nav-links">
    <a class="btn btn-primary" href="/login">Login</a>
    <a class="btn btn-outline" href="/admin">Admin</a>
  </div>
</body>
</html>`);
});

// Login page
app.get('/login', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login - QSE Ecosystem</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --primary: #6c63ff;
      --bg: #0a0a0a;
      --surface: #141414;
      --surface-2: #1e1e1e;
      --text: #f5f5f5;
      --text-muted: #888;
      --border: #2a2a2a;
      --radius: 12px;
    }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; display: flex; flex-direction: column; }
    header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; }
    .logo { font-size: 1.3rem; font-weight: 700; color: var(--primary); text-decoration: none; }
    .back-link { color: var(--text-muted); text-decoration: none; font-size: 0.9rem; }
    .back-link:hover { color: var(--text); }
    main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 20px; }
    .auth-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 40px; width: 100%; max-width: 420px; }
    h1 { font-size: 1.8rem; font-weight: 700; margin-bottom: 8px; }
    .desc { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 28px; }
    .form { display: flex; flex-direction: column; gap: 14px; }
    .form label { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px; display: block; }
    .form input { background: var(--surface-2); border: 1px solid var(--border); border-radius: 8px; padding: 12px 16px; color: var(--text); font-size: 0.95rem; width: 100%; outline: none; transition: border-color 0.2s; }
    .form input:focus { border-color: var(--primary); }
    .btn { display: inline-block; padding: 12px 24px; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; border: none; transition: opacity 0.2s; text-align: center; }
    .btn-primary { background: var(--primary); color: #fff; width: 100%; }
    .btn:hover { opacity: 0.85; }
    .error-msg { color: #f87171; font-size: 0.9rem; text-align: center; display: none; }
    .divider { text-align: center; color: var(--text-muted); font-size: 0.85rem; margin: 4px 0; }
    .toggle-link { color: var(--primary); cursor: pointer; text-decoration: underline; font-size: 0.9rem; }
    .register-section { display: none; }
    footer { background: var(--surface); border-top: 1px solid var(--border); padding: 16px 24px; text-align: center; color: var(--text-muted); font-size: 0.85rem; }
    footer a { color: var(--primary); text-decoration: none; }
  </style>
</head>
<body>
  <header>
    <a class="logo" href="/">QSE Ecosystem</a>
    <a class="back-link" href="/">&larr; Back to Home</a>
  </header>
  <main>
    <div class="auth-card">
      <div id="login-section">
        <h1>Welcome back</h1>
        <p class="desc">Sign in to your QSE account</p>
        <form class="form" id="login-form">
          <div>
            <label for="login-email">Email</label>
            <input type="email" id="login-email" placeholder="you@example.com" required />
          </div>
          <div>
            <label for="login-password">Password</label>
            <input type="password" id="login-password" placeholder="Your password" required />
          </div>
          <p class="error-msg" id="login-error"></p>
          <button type="submit" class="btn btn-primary">Sign In</button>
        </form>
        <p class="divider" style="margin-top:20px;">Don&apos;t have an account? <span class="toggle-link" onclick="showRegister()">Register</span></p>
      </div>
      <div class="register-section" id="register-section">
        <h1>Create account</h1>
        <p class="desc">Join the QSE Ecosystem</p>
        <form class="form" id="register-form">
          <div>
            <label for="reg-name">Full Name</label>
            <input type="text" id="reg-name" placeholder="Your full name" required />
          </div>
          <div>
            <label for="reg-email">Email</label>
            <input type="email" id="reg-email" placeholder="you@example.com" required />
          </div>
          <div>
            <label for="reg-password">Password</label>
            <input type="password" id="reg-password" placeholder="Choose a password" required />
          </div>
          <p class="error-msg" id="register-error"></p>
          <button type="submit" class="btn btn-primary">Create Account</button>
        </form>
        <p class="divider" style="margin-top:20px;">Already have an account? <span class="toggle-link" onclick="showLogin()">Sign In</span></p>
      </div>
    </div>
  </main>
  <footer>
    &copy; 2025 <a href="/">QSE Ecosystem</a>
  </footer>
  <script>
    function showRegister() {
      document.getElementById('login-section').style.display = 'none';
      document.getElementById('register-section').style.display = 'block';
    }
    function showLogin() {
      document.getElementById('register-section').style.display = 'none';
      document.getElementById('login-section').style.display = 'block';
    }

    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const errEl = document.getElementById('login-error');
      errEl.style.display = 'none';
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!data.ok) {
          errEl.textContent = data.message || 'Invalid credentials';
          errEl.style.display = 'block';
          return;
        }
        localStorage.setItem('qse_token', data.token);
        localStorage.setItem('qse_user', JSON.stringify(data.user));
        window.location.href = '/admin';
      } catch (err) {
        errEl.textContent = 'Something went wrong. Please try again.';
        errEl.style.display = 'block';
      }
    });

    document.getElementById('register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const errEl = document.getElementById('register-error');
      errEl.style.display = 'none';
      const fullName = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName, email, password })
        });
        const data = await res.json();
        if (!data.ok) {
          errEl.textContent = data.message || 'Registration failed';
          errEl.style.display = 'block';
          return;
        }
        showLogin();
        document.getElementById('login-email').value = email;
      } catch (err) {
        errEl.textContent = 'Something went wrong. Please try again.';
        errEl.style.display = 'block';
      }
    });

    // Redirect to admin if already logged in
    const token = localStorage.getItem('qse_token');
    if (token) window.location.href = '/admin';
  </script>
</body>
</html>`);
});

// Admin dashboard page
app.get('/admin', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin - QSE Ecosystem</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --primary: #6c63ff;
      --bg: #0a0a0a;
      --surface: #141414;
      --surface-2: #1e1e1e;
      --text: #f5f5f5;
      --text-muted: #888;
      --border: #2a2a2a;
      --radius: 12px;
    }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; display: flex; flex-direction: column; }
    header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; }
    .logo { font-size: 1.3rem; font-weight: 700; color: var(--primary); text-decoration: none; }
    .header-right { display: flex; align-items: center; gap: 16px; }
    .user-badge { font-size: 0.9rem; color: var(--text-muted); }
    .btn { display: inline-block; padding: 8px 18px; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; border: none; transition: opacity 0.2s; text-decoration: none; }
    .btn-outline { background: transparent; color: var(--primary); border: 2px solid var(--primary); }
    .btn:hover { opacity: 0.8; }
    main { flex: 1; padding: 40px 24px; max-width: 1100px; margin: 0 auto; width: 100%; }
    h1 { font-size: 2rem; font-weight: 700; margin-bottom: 6px; }
    .page-desc { color: var(--text-muted); margin-bottom: 36px; }
    .section-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 16px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.8rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-bottom: 40px; }
    .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; }
    .stat-number { font-size: 2rem; font-weight: 700; color: var(--primary); }
    .stat-label { font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; }
    .info-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; margin-bottom: 24px; }
    .info-card h2 { font-size: 1.1rem; margin-bottom: 16px; }
    .info-row { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: var(--text-muted); min-width: 120px; }
    .nav-apps { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 40px; }
    .app-link { background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px 24px; text-decoration: none; color: var(--text); transition: border-color 0.2s; }
    .app-link:hover { border-color: var(--primary); }
    .app-link span { display: block; color: var(--text-muted); font-size: 0.85rem; margin-top: 4px; }
    footer { background: var(--surface); border-top: 1px solid var(--border); padding: 16px 24px; text-align: center; color: var(--text-muted); font-size: 0.85rem; }
    footer a { color: var(--primary); text-decoration: none; }
    #auth-loading { text-align: center; padding: 80px; color: var(--text-muted); }
    #admin-content { display: none; }
  </style>
</head>
<body>
  <header>
    <a class="logo" href="/">QSE Ecosystem</a>
    <div class="header-right">
      <span class="user-badge" id="header-user"></span>
      <button class="btn btn-outline" onclick="logout()">Sign Out</button>
    </div>
  </header>
  <main>
    <div id="auth-loading">Verifying session&hellip;</div>
    <div id="admin-content">
      <h1>Admin Dashboard</h1>
      <p class="page-desc">Manage and monitor the QSE Ecosystem</p>

      <p class="section-title">Platform Apps</p>
      <div class="nav-apps">
        <a class="app-link" href="/sculptify">
          <strong>Sculptify</strong>
          <span>Beauty, wellness &amp; training</span>
        </a>
        <a class="app-link" href="/march-lewis">
          <strong>March &amp; Lewis</strong>
          <span>Career staffing &amp; workforce</span>
        </a>
      </div>

      <p class="section-title">API Health</p>
      <div class="grid" id="stats-grid">
        <div class="stat-card"><div class="stat-number" id="stat-health">—</div><div class="stat-label">Server Status</div></div>
        <div class="stat-card"><div class="stat-number" id="stat-sculptify">—</div><div class="stat-label">Sculptify Bookings</div></div>
        <div class="stat-card"><div class="stat-number" id="stat-candidates">—</div><div class="stat-label">M&amp;L Candidates</div></div>
        <div class="stat-card"><div class="stat-number" id="stat-jobs">—</div><div class="stat-label">M&amp;L Jobs</div></div>
      </div>

      <p class="section-title">Account Details</p>
      <div class="info-card">
        <h2>Your Profile</h2>
        <div class="info-row"><span class="info-label">Full Name</span><span id="user-name">—</span></div>
        <div class="info-row"><span class="info-label">Email</span><span id="user-email">—</span></div>
        <div class="info-row"><span class="info-label">Member Since</span><span id="user-since">—</span></div>
      </div>
    </div>
  </main>
  <footer>
    &copy; 2025 <a href="/">QSE Ecosystem</a>
  </footer>
  <script>
    const token = localStorage.getItem('qse_token');
    if (!token) {
      window.location.href = '/login';
    } else {
      (async () => {
        try {
          const res = await fetch('/api/auth/me', { headers: { Authorization: 'Bearer ' + token } });
          if (!res.ok) throw new Error('Unauthorized');
          const data = await res.json();
          const user = data.user;
          document.getElementById('header-user').textContent = user.fullName || user.email;
          document.getElementById('user-name').textContent = user.fullName || '—';
          document.getElementById('user-email').textContent = user.email || '—';
          document.getElementById('user-since').textContent = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—';
          document.getElementById('auth-loading').style.display = 'none';
          document.getElementById('admin-content').style.display = 'block';
          loadStats(token);
        } catch (e) {
          localStorage.removeItem('qse_token');
          localStorage.removeItem('qse_user');
          window.location.href = '/login';
        }
      })();
    }

    async function loadStats(token) {
      try {
        const h = await fetch('/health');
        const hd = await h.json();
        document.getElementById('stat-health').textContent = hd.ok ? 'Online' : 'Offline';
      } catch (e) { document.getElementById('stat-health').textContent = 'Offline'; }

      try {
        const r = await fetch('/api/sculptify/bookings', { headers: { Authorization: 'Bearer ' + token } });
        const d = await r.json();
        document.getElementById('stat-sculptify').textContent = Array.isArray(d.bookings) ? d.bookings.length : '—';
      } catch (e) { document.getElementById('stat-sculptify').textContent = '—'; }

      try {
        const r = await fetch('/api/march-lewis/candidates', { headers: { Authorization: 'Bearer ' + token } });
        const d = await r.json();
        document.getElementById('stat-candidates').textContent = Array.isArray(d.candidates) ? d.candidates.length : '—';
      } catch (e) { document.getElementById('stat-candidates').textContent = '—'; }

      try {
        const r = await fetch('/api/march-lewis/jobs', { headers: { Authorization: 'Bearer ' + token } });
        const d = await r.json();
        document.getElementById('stat-jobs').textContent = Array.isArray(d.jobs) ? d.jobs.length : '—';
      } catch (e) { document.getElementById('stat-jobs').textContent = '—'; }
    }

    function logout() {
      localStorage.removeItem('qse_token');
      localStorage.removeItem('qse_user');
      window.location.href = '/login';
    }
  </script>
</body>
</html>`);
});

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err && err.stack ? err.stack : err);
  res.status(500).json({ ok: false, message: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Initialize DB tables for services
require('./services/sculptifyService').init().catch(console.error);
require('./services/marchLewisService').init().catch(console.error);
require('./services/authService').init().catch(console.error);
