const express = require('express');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/sculptify', express.static(path.resolve(__dirname, '..', 'apps', 'sculptify-web', 'public')));
app.use('/march-lewis', express.static(path.resolve(__dirname, '..', 'apps', 'march-lewis-web', 'public')));

// Compatibility APIs used by the existing QSE/Sculptify public apps.
app.use('/api/health', require('../routes/health'));
app.use('/api/ai', require('../routes/ai'));
app.use('/api/training', require('../routes/training'));
app.use('/api/tasks', require('../routes/tasks'));
app.use('/api/wallets', require('../routes/wallets'));

// Current service APIs.
app.use('/api/sculptify', require('./routes/sculptify'));
app.use('/api/march-lewis', require('./routes/marchLewis'));
app.use('/api/auth', require('./routes/auth'));

app.get('/sculptify/*', (_req, res) => res.sendFile(path.join(__dirname, '..', 'apps', 'sculptify-web', 'public', 'index.html')));
app.get('/march-lewis/*', (_req, res) => res.sendFile(path.join(__dirname, '..', 'apps', 'march-lewis-web', 'public', 'index.html')));

const uploadDir = path.join(__dirname, 'uploads');
const upload = multer({ dest: uploadDir });
app.use('/uploads', express.static(uploadDir));

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, message: 'No file uploaded' });
  const urlPath = '/uploads/' + req.file.filename;
  res.json({ ok: true, url: urlPath, filename: req.file.originalname });
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use((err, _req, res, _next) => {
  console.error(err && err.stack ? err.stack : err);
  res.status(500).json({ ok: false, message: 'Server error' });
});

app.listen(PORT, () => {
  console.log('Server listening on http://localhost:' + PORT);
});

require('./services/sculptifyService').init().catch(console.error);
require('./services/marchLewisService').init().catch(console.error);
require('./services/authService').init().catch(console.error);
