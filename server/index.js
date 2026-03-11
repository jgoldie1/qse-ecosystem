const express = require('express');
const path = require('path');
const multer = require('multer');
const morgan = require('morgan');
const compression = require('compression');
const { helmetMiddleware, corsMiddleware } = require('./middleware/security');
const { authLimiter, uploadLimiter, staticLimiter } = require('./middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// QSE home portal
app.get('/', staticLimiter, (_req, res) => res.sendFile(path.join(__dirname, '..', 'apps', 'qse-home', 'public', 'index.html')));

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
app.use("/api/auth", authLimiter, require("./routes/auth"));

// Simple file upload endpoint used by public sites
app.post('/api/upload', uploadLimiter, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, message: 'No file uploaded' });
  const urlPath = `/uploads/${req.file.filename}`;
  res.json({ ok: true, url: urlPath, filename: req.file.originalname });
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
