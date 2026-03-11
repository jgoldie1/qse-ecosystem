const express = require('express');
const path = require('path');
const multer = require('multer');
const { version } = require('../package.json');

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
app.get('/api/health', (_req, res) => res.json({
  status: 'ok',
  message: 'QSE Ecosystem is healthy',
  timestamp: new Date().toISOString(),
  version
}));

// Root landing page
app.get('/', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
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
    </body>
    </html>
  `);
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
