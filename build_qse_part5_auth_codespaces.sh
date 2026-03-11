#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(pwd)"
SERVER="$ROOT/server"

mkdir -p "$SERVER/middleware" "$SERVER/routes" "$SERVER/services" "$ROOT/.devcontainer"

cat > "$SERVER/middleware/auth.js" <<'JS'
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'dev-secret';

function generateToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ ok: false, message: 'Missing authorization' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ ok: false, message: 'Invalid authorization format' });
  try {
    const payload = jwt.verify(parts[1], SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, message: 'Invalid token' });
  }
}

module.exports = { generateToken, requireAuth };
JS

cat > "$SERVER/services/authService.js" <<'JS'
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3');

const DB_PATH = path.join(__dirname, '..', 'data', 'qse.db');

function openDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return new sqlite3.Database(DB_PATH);
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

async function init() {
  const db = openDb();
  await run(db, `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, fullName TEXT, email TEXT UNIQUE, passwordHash TEXT, createdAt TEXT)`);
  db.close();
}

async function registerUser({ fullName, email, password }) {
  const db = openDb();
  const passwordHash = await bcrypt.hash(password, 10);
  const createdAt = new Date().toISOString();
  const res = await run(db, 'INSERT INTO users (fullName,email,passwordHash,createdAt) VALUES (?,?,?,?)', [fullName, email, passwordHash, createdAt]);
  db.close();
  return { id: res.lastID, fullName, email, createdAt };
}

async function authenticateUser({ email, password }) {
  const db = openDb();
  const user = await get(db, 'SELECT * FROM users WHERE email = ?', [email]);
  db.close();
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return { id: user.id, fullName: user.fullName, email: user.email };
}

async function getUserById(id) {
  const db = openDb();
  const user = await get(db, 'SELECT id, fullName, email, createdAt FROM users WHERE id = ?', [id]);
  db.close();
  return user;
}

module.exports = { init, registerUser, authenticateUser, getUserById };
JS

cat > "$SERVER/routes/auth.js" <<'JS'
const express = require('express');
const router = express.Router();
const { registerUser, authenticateUser, getUserById } = require('../services/authService');
const { generateToken, requireAuth } = require('../middleware/auth');

router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    const user = await registerUser({ fullName, email, password });
    res.status(201).json({ ok: true, user });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authenticateUser({ email, password });
    if (!user) return res.status(401).json({ ok: false, message: 'Invalid credentials' });
    const token = generateToken({ id: user.id, email: user.email });
    res.json({ ok: true, token, user });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id);
    res.json({ ok: true, user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
JS

cat > ".devcontainer/devcontainer.json" <<'JSON'
{
  "name": "QSE Codespace",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:0-20",
  "forwardPorts": [3000],
  "postCreateCommand": "npm install",
  "remoteUser": "node"
}
JSON

# mount auth route into server/index.js if not already present
if ! grep -q "'/api/auth'" server/index.js; then
  awk '/\/api\/march-lewis/ { print; print "app.use(\"/api/auth\", require(\"./routes/auth\"));"; next }1' server/index.js > server/index.tmp && mv server/index.tmp server/index.js
fi

# ensure services init called on startup by appending init calls to server/index.js if not present
if ! grep -q "authService.init" server/index.js; then
  awk '1; END{ print "\n// Initialize DB tables for services"; print "require('./services/sculptifyService').init().catch(console.error);"; print "require('./services/marchLewisService').init().catch(console.error);"; print "require('./services/authService').init().catch(console.error);" }' server/index.js > server/index.tmp && mv server/index.tmp server/index.js
fi

echo "Installing auth dependencies..."
npm install jsonwebtoken bcryptjs cors

echo "Part 5 build script complete"
