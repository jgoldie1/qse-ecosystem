const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
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

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true, status: 'healthy', timestamp: new Date().toISOString() }));
app.get('/health', (_req, res) => res.json({ ok: true }));

// Login page
app.get('/login', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>QSE Login</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: sans-serif; background: #0a0a0a; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 40px; width: 100%; max-width: 400px; }
    h1 { font-size: 1.8rem; margin-bottom: 8px; text-align: center; }
    p.sub { color: #aaa; text-align: center; margin-bottom: 28px; font-size: 0.95rem; }
    label { display: block; font-size: 0.85rem; color: #aaa; margin-bottom: 6px; }
    input { width: 100%; background: #111; border: 1px solid #333; border-radius: 8px; padding: 10px 14px; color: #fff; font-size: 1rem; margin-bottom: 18px; }
    input:focus { outline: none; border-color: #6c63ff; }
    button { width: 100%; background: #6c63ff; border: none; border-radius: 8px; padding: 12px; color: #fff; font-size: 1rem; cursor: pointer; font-weight: 600; }
    button:hover { background: #5a52d5; }
    #msg { margin-top: 14px; text-align: center; font-size: 0.9rem; }
    .err { color: #ff6b6b; }
    .ok  { color: #6bff8a; }
    .links { margin-top: 20px; text-align: center; font-size: 0.88rem; color: #aaa; }
    .links a { color: #6c63ff; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <h1>QSE Ecosystem</h1>
    <p class="sub">Sign in to your account</p>
    <form id="loginForm">
      <label for="email">Email</label>
      <input type="email" id="email" name="email" placeholder="you@example.com" required />
      <label for="password">Password</label>
      <input type="password" id="password" name="password" placeholder="••••••••" required />
      <button type="submit">Sign In</button>
      <div id="msg"></div>
    </form>
    <div class="links"><a href="/admin">Admin Dashboard</a> &nbsp;|&nbsp; <a href="/">Home</a></div>
  </div>
  <script>
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = document.getElementById('msg');
      msg.textContent = '';
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.ok) {
          localStorage.setItem('qse_token', data.token);
          msg.className = 'ok';
          msg.textContent = 'Login successful! Redirecting...';
          setTimeout(() => window.location.href = '/admin', 800);
        } else {
          msg.className = 'err';
          msg.textContent = data.message || 'Login failed';
        }
      } catch (err) {
        msg.className = 'err';
        msg.textContent = 'Network error. Please try again.';
      }
    });
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
  <title>QSE Admin</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: sans-serif; background: #0a0a0a; color: #fff; min-height: 100vh; }
    header { background: #111; border-bottom: 1px solid #222; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; }
    header h1 { font-size: 1.4rem; }
    header span { color: #aaa; font-size: 0.9rem; }
    .logout { background: none; border: 1px solid #555; border-radius: 6px; color: #aaa; padding: 6px 14px; cursor: pointer; font-size: 0.85rem; }
    .logout:hover { border-color: #ff6b6b; color: #ff6b6b; }
    main { padding: 32px; }
    h2 { font-size: 1.1rem; color: #aaa; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .stat { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 24px; }
    .stat .label { font-size: 0.8rem; color: #888; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .stat .value { font-size: 2rem; font-weight: 700; }
    .stat .sub { font-size: 0.8rem; color: #6bff8a; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; background: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #333; }
    th { background: #111; padding: 12px 16px; text-align: left; font-size: 0.8rem; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 12px 16px; border-top: 1px solid #222; font-size: 0.9rem; }
    #healthBadge { display: inline-block; padding: 3px 10px; border-radius: 100px; font-size: 0.75rem; font-weight: 600; }
    .badge-ok { background: #1a3d2b; color: #6bff8a; }
    .badge-err { background: #3d1a1a; color: #ff6b6b; }
    #userList td:last-child { color: #aaa; font-size: 0.8rem; }
    .section-title { font-size: 1rem; font-weight: 600; margin-bottom: 14px; }
    #authMessage { margin-top: 20px; padding: 16px; background: #1a1a1a; border: 1px solid #333; border-radius: 8px; color: #aaa; font-size: 0.9rem; }
  </style>
</head>
<body>
  <header>
    <h1>⚡ QSE Admin</h1>
    <div style="display:flex;align-items:center;gap:16px;">
      <span id="userGreeting"></span>
      <button class="logout" onclick="logout()">Logout</button>
    </div>
  </header>
  <main>
    <h2>Dashboard &nbsp;<span id="healthBadge"></span></h2>
    <div class="grid">
      <div class="stat"><div class="label">API Status</div><div class="value" id="apiStatus">—</div><div class="sub" id="apiTs"></div></div>
      <div class="stat"><div class="label">Registered Users</div><div class="value" id="userCount">—</div><div class="sub">in database</div></div>
      <div class="stat"><div class="label">Server</div><div class="value">Node.js</div><div class="sub">Express + SQLite</div></div>
    </div>

    <div class="section-title">Registered Users</div>
    <table>
      <thead><tr><th>#</th><th>Full Name</th><th>Email</th><th>Joined</th></tr></thead>
      <tbody id="userList"><tr><td colspan="4" style="color:#555">Loading…</td></tr></tbody>
    </table>

    <div id="authMessage" style="display:none"></div>
  </main>
  <script>
    const token = localStorage.getItem('qse_token');

    async function init() {
      // Health check
      try {
        const r = await fetch('/api/health');
        const d = await r.json();
        document.getElementById('apiStatus').textContent = d.ok ? 'Online' : 'Degraded';
        document.getElementById('apiTs').textContent = d.timestamp ? new Date(d.timestamp).toLocaleTimeString() : '';
        const badge = document.getElementById('healthBadge');
        badge.textContent = d.ok ? '● Healthy' : '● Error';
        badge.className = 'badge-' + (d.ok ? 'ok' : 'err');
      } catch(e) {
        document.getElementById('apiStatus').textContent = 'Offline';
      }

      // Auth-gated user list
      if (!token) {
        const msg = document.getElementById('authMessage');
        msg.style.display = 'block';
        msg.innerHTML = '🔒 <a href="/login" style="color:#6c63ff">Sign in</a> to view user data.';
        document.getElementById('userList').innerHTML = '<tr><td colspan="4" style="color:#555">Authentication required</td></tr>';
        return;
      }

      try {
        const r = await fetch('/api/auth/me', { headers: { Authorization: 'Bearer ' + token } });
        if (!r.ok) throw new Error('Unauthorized');
        const d = await r.json();
        const name = (d.user && d.user.fullName) ? d.user.fullName : (d.user && d.user.email) ? d.user.email : 'Admin';
        document.getElementById('userGreeting').textContent = 'Hello, ' + name;
      } catch(e) {
        localStorage.removeItem('qse_token');
        window.location.href = '/login';
        return;
      }

      // Load users (reuse /api/auth/me for now — extend with admin endpoint as needed)
      document.getElementById('userCount').textContent = '—';
      document.getElementById('userList').innerHTML = '<tr><td colspan="4" style="color:#555">User listing requires an admin API (coming soon)</td></tr>';
    }

    function logout() {
      localStorage.removeItem('qse_token');
      window.location.href = '/login';
    }

    init();
  </script>
</body>
</html>`);
});

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
