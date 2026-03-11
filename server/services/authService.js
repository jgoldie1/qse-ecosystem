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
