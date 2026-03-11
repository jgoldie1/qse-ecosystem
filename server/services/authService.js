const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db/init');
const { JWT_SECRET } = require('../middleware/auth');

function listUsers() {
  const db = getDb();
  const rows = db.prepare('SELECT id, email, role, created_at FROM users ORDER BY id DESC').all();
  return rows;
}

async function registerUser({ email, password, role = 'user' }) {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    const error = new Error('Email already registered');
    error.status = 409;
    throw error;
  }
  const hashed = await bcrypt.hash(password, 12);
  const result = db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)').run(email, hashed, role);
  return { id: result.lastInsertRowid, email, role };
}

async function loginUser({ email, password }) {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  return { token, user: { id: user.id, email: user.email, role: user.role } };
}

module.exports = { listUsers, registerUser, loginUser };
