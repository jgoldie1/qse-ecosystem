const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const apiRoutes = require('./server/routes');
const { initDatabase } = require('./server/db/init');

const app = express();
const PORT = Number(process.env.PORT || 5000);

const sculptifyPublic = path.join(__dirname, 'apps', 'sculptify-web', 'public');
const marchPublic = path.join(__dirname, 'apps', 'march-lewis-web', 'public');

app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const staticLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', apiRoutes);
app.use('/sculptify', staticLimiter, express.static(sculptifyPublic));
app.use('/march-lewis', staticLimiter, express.static(marchPublic));

app.get('/sculptify', staticLimiter, (_req, res) => {
  res.sendFile(path.join(sculptifyPublic, 'index.html'));
});

app.get('/march-lewis', staticLimiter, (_req, res) => {
  res.sendFile(path.join(marchPublic, 'index.html'));
});

app.get('/', (_req, res) => {
  res.send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>QSE Ecosystem</title>
  <style>
    body{font-family:Arial,sans-serif;background:#0f172a;color:#e5e7eb;padding:32px}
    .card{max-width:900px;margin:auto;background:#111827;border-radius:18px;padding:24px}
    a{color:#7dd3fc;display:block;margin:12px 0;font-size:18px}
    code{color:#fca5a5}
  </style>
</head>
<body>
  <div class="card">
    <h1>QSE Ecosystem Master Build</h1>
    <p>Server is running.</p>
    <p>Seed admin login: <code>admin@qse.local</code> / <code>Admin123!</code></p>
    <a href="/api/health">/api/health</a>
    <a href="/api/sculptify/providers">/api/sculptify/providers</a>
    <a href="/api/march-lewis/jobs">/api/march-lewis/jobs</a>
    <a href="/sculptify">/sculptify</a>
    <a href="/march-lewis">/march-lewis</a>
  </div>
</body>
</html>`);
});

app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Route not found', route: req.originalUrl });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(status).json({
    ok: false,
    error: status < 500 ? err.message : 'Internal server error',
    ...(isDev && status >= 500 && { message: err.message })
  });
});

initDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`QSE server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database init failed:', error);
    process.exit(1);
  });

module.exports = app;
