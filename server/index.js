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

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Root landing page
app.get('/', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>QSE Ecosystem</title>
  <style>
    body { font-family: sans-serif; background: #0a0a0a; color: #fff; text-align: center; padding: 60px 20px; }
    h1 { font-size: 3rem; margin-bottom: 10px; }
    p { font-size: 1.2rem; color: #aaa; margin-bottom: 40px; }
    .apps { display: flex; justify-content: center; gap: 30px; flex-wrap: wrap; }
    .card { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 30px 40px; text-decoration: none; color: #fff; transition: border-color 0.2s; }
    .card:hover { border-color: #6c63ff; }
    .card h2 { margin: 0 0 8px; font-size: 1.5rem; }
    .card span { color: #aaa; font-size: 0.95rem; }
    .nav-links { margin-top: 30px; }
    .nav-links a { color: #aaa; text-decoration: none; margin: 0 12px; font-size: 0.95rem; }
    .nav-links a:hover { color: #6c63ff; }
  </style>
</head>
<body>
  <h1>QSE Ecosystem</h1>
  <p>Your unified platform for Sculptify and March &amp; Lewis</p>
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
    <a href="/login">Login</a>
    <a href="/admin">Admin</a>
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
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: sans-serif; background: #0a0a0a; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 40px; width: 100%; max-width: 400px; }
    h1 { margin: 0 0 24px; font-size: 1.75rem; text-align: center; }
    label { display: block; margin-bottom: 6px; font-size: 0.9rem; color: #aaa; }
    input { width: 100%; padding: 10px 14px; background: #0a0a0a; border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 1rem; margin-bottom: 16px; }
    input:focus { outline: none; border-color: #6c63ff; }
    button { width: 100%; padding: 12px; background: #6c63ff; border: none; border-radius: 8px; color: #fff; font-size: 1rem; cursor: pointer; font-weight: 600; }
    button:hover { background: #574fd6; }
    .message { margin-top: 16px; text-align: center; font-size: 0.9rem; }
    .error { color: #ff6b6b; }
    .success { color: #51cf66; }
    .footer-link { text-align: center; margin-top: 20px; color: #aaa; font-size: 0.9rem; }
    .footer-link a { color: #6c63ff; text-decoration: none; }
    .footer-link a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <h1>QSE Login</h1>
    <form id="login-form">
      <label for="email">Email</label>
      <input type="email" id="email" placeholder="you@example.com" required />
      <label for="password">Password</label>
      <input type="password" id="password" placeholder="Your password" required />
      <button type="submit">Sign In</button>
      <div class="message" id="message"></div>
    </form>
    <div class="footer-link"><a href="/">Back to Home</a></div>
  </div>
  <script>
    document.getElementById('login-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const msg = document.getElementById('message');
      msg.textContent = '';
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.ok) {
          localStorage.setItem('qse_token', data.token);
          localStorage.setItem('qse_user', JSON.stringify(data.user));
          msg.className = 'message success';
          msg.textContent = 'Login successful! Redirecting...';
          setTimeout(() => { window.location.href = '/admin'; }, 1000);
        } else {
          msg.className = 'message error';
          msg.textContent = data.message || 'Login failed';
        }
      } catch (err) {
        msg.className = 'message error';
        msg.textContent = 'Network error. Please try again.';
      }
    });
  </script>
</body>
</html>`);
});

// Admin page
app.get('/admin', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin - QSE Ecosystem</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: sans-serif; background: #0a0a0a; color: #fff; margin: 0; }
    header { background: #1a1a1a; border-bottom: 1px solid #333; padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; }
    header h1 { margin: 0; font-size: 1.4rem; }
    .user-info { color: #aaa; font-size: 0.9rem; display: flex; align-items: center; gap: 16px; }
    button.logout { background: transparent; border: 1px solid #555; border-radius: 6px; color: #aaa; padding: 6px 14px; cursor: pointer; font-size: 0.9rem; }
    button.logout:hover { border-color: #ff6b6b; color: #ff6b6b; }
    main { padding: 40px 32px; max-width: 1100px; margin: 0 auto; }
    h2 { font-size: 1.5rem; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .stat-card { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 24px; text-align: center; }
    .stat-card .num { font-size: 2.5rem; font-weight: 700; color: #6c63ff; }
    .stat-card .label { color: #aaa; font-size: 0.95rem; margin-top: 6px; }
    .links { display: flex; gap: 16px; flex-wrap: wrap; }
    .links a { background: #1a1a1a; border: 1px solid #333; border-radius: 10px; padding: 16px 24px; text-decoration: none; color: #fff; transition: border-color 0.2s; font-weight: 500; }
    .links a:hover { border-color: #6c63ff; }
    #auth-notice { display: none; }
  </style>
</head>
<body>
  <header>
    <h1>QSE Admin</h1>
    <div class="user-info">
      <span id="user-name">Loading...</span>
      <button class="logout" id="logout-btn">Logout</button>
    </div>
  </header>
  <main>
    <div id="auth-notice">You are not logged in. <a href="/login" style="color:#6c63ff;">Sign in</a> for full access.</div>
    <h2>Dashboard</h2>
    <div class="grid">
      <div class="stat-card"><div class="num" id="stat-users">-</div><div class="label">Registered Users</div></div>
      <div class="stat-card"><div class="num" id="stat-apps">2</div><div class="label">Active Apps</div></div>
      <div class="stat-card"><div class="num" id="stat-health">-</div><div class="label">API Health</div></div>
    </div>
    <h2>Quick Links</h2>
    <div class="links">
      <a href="/">Home</a>
      <a href="/sculptify">Sculptify App</a>
      <a href="/march-lewis">March &amp; Lewis App</a>
      <a href="/api/health">API Health</a>
    </div>
  </main>
  <script>
    function getStoredUser() {
      try {
        const raw = localStorage.getItem('qse_user');
        if (!raw) return null;
        const u = JSON.parse(raw);
        if (!u || typeof u !== 'object' || typeof u.email !== 'string') return null;
        return u;
      } catch (_) { return null; }
    }

    const token = localStorage.getItem('qse_token');
    const user = getStoredUser();

    if (!token || !user) {
      window.location.replace('/login');
    } else {
      document.getElementById('user-name').textContent = user.fullName || user.email;
    }

    document.getElementById('logout-btn').addEventListener('click', function() {
      localStorage.removeItem('qse_token');
      localStorage.removeItem('qse_user');
      window.location.href = '/login';
    });

    // Check API health
    fetch('/api/health')
      .then(r => r.json())
      .then(data => {
        document.getElementById('stat-health').textContent = data.ok ? '✓' : '✗';
      })
      .catch(() => {
        document.getElementById('stat-health').textContent = '✗';
      });
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
