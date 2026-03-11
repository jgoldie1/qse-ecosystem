/**
 * March & Lewis Service - SQLite-backed data layer for March & Lewis Staffing
 */

const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '../../data/marchlewis.db');

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    type TEXT,
    location TEXT,
    createdAt TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS employers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    companyName TEXT NOT NULL,
    hiringManager TEXT NOT NULL,
    email TEXT NOT NULL,
    positionType TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    createdAt TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    workAuthorization TEXT NOT NULL,
    availability TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    createdAt TEXT DEFAULT (datetime('now'))
  );
`);

function getJobs() {
  return db.prepare('SELECT * FROM jobs ORDER BY createdAt DESC').all();
}

function getEmployers() {
  return db.prepare('SELECT * FROM employers ORDER BY createdAt DESC').all();
}

function createEmployer(data) {
  const { companyName, hiringManager, email, positionType } = data;
  const stmt = db.prepare(
    'INSERT INTO employers (companyName, hiringManager, email, positionType) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(companyName, hiringManager, email, positionType);
  return { id: result.lastInsertRowid, companyName, hiringManager, email, positionType, status: 'pending' };
}

function getCandidates() {
  return db.prepare('SELECT * FROM candidates ORDER BY createdAt DESC').all();
}

function createCandidate(data) {
  const { fullName, email, phone, workAuthorization, availability } = data;
  const stmt = db.prepare(
    'INSERT INTO candidates (fullName, email, phone, workAuthorization, availability) VALUES (?, ?, ?, ?, ?)'
  );
  const result = stmt.run(fullName, email, phone, workAuthorization, availability);
  return { id: result.lastInsertRowid, fullName, email, phone, workAuthorization, availability, status: 'pending' };
}

function getDashboardMetrics() {
  const jobs = db.prepare('SELECT COUNT(*) as count FROM jobs').get().count;
  const employers = db.prepare('SELECT COUNT(*) as count FROM employers').get().count;
  const candidates = db.prepare('SELECT COUNT(*) as count FROM candidates').get().count;
  return { jobs, employers, candidates };
}

module.exports = {
  getJobs,
  getEmployers,
  createEmployer,
  getCandidates,
  createCandidate,
  getDashboardMetrics
};
