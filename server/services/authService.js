const bcrypt = require('bcrypt');
const { run, get } = require('../db/sqlite');

async function init() {
  // Schema is managed by migrate.js; nothing to do here
}

function sanitizeUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at || null
  };
}

async function registerUser({ name, email, password, role = 'viewer' }) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const passwordHash = await bcrypt.hash(String(password), 10);
  const result = await run(
    'INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)',
    [String(name).trim(), normalizedEmail, passwordHash, role, new Date().toISOString()]
  );
  const created = await get('SELECT * FROM users WHERE id = ?', [result.lastID]);
  return sanitizeUser(created);
}

async function authenticateUser({ email, password }) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await get('SELECT * FROM users WHERE lower(email) = ?', [normalizedEmail]);
  if (!user) return null;
  const ok = await bcrypt.compare(String(password), user.password_hash);
  if (!ok) return null;
  return sanitizeUser(user);
}

async function getUserById(id) {
  const user = await get('SELECT * FROM users WHERE id = ?', [id]);
  return sanitizeUser(user);
}

module.exports = { init, registerUser, authenticateUser, getUserById, sanitizeUser };
