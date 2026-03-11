const express = require('express');
const path = require('path');

const healthRoutes = require('./routes/health');
const aiRoutes = require('./routes/ai');
const taskRoutes = require('./routes/tasks');
const trainingRoutes = require('./routes/training');
const walletRoutes = require('./routes/wallets');
const streamingRoutes = require('./routes/streaming');
const rewardRoutes = require('./routes/rewards');
const membershipRoutes = require('./routes/memberships');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Serve static files for Sculptify web app
app.use('/sculptify', express.static(path.join(__dirname, 'apps/sculptify-web/public')));

// Serve static files for March and Lewis web app
app.use('/march-lewis', express.static(path.join(__dirname, 'apps/march-lewis-web/public')));
// Serve March & Lewis src/ modules and pages (ES module source files)
app.use('/march-lewis', express.static(path.join(__dirname, 'apps/march-lewis-web/src')));

// API routes
app.use('/api/health', healthRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/streaming', streamingRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/memberships', membershipRoutes);

// Root landing page
app.get('/', (req, res) => {
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

app.listen(PORT, () => {
  console.log(`QSE Ecosystem running on http://localhost:${PORT}`);
});

module.exports = app;
