const path = require('path');
const fs = require('fs');
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

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function init() {
  const db = openDb();
  await run(db, `CREATE TABLE IF NOT EXISTS jobs (id INTEGER PRIMARY KEY, title TEXT, description TEXT)`);
  await run(db, `CREATE TABLE IF NOT EXISTS employers (id INTEGER PRIMARY KEY, companyName TEXT, hiringManager TEXT, email TEXT, positionType TEXT, createdAt TEXT)`);
  await run(db, `CREATE TABLE IF NOT EXISTS candidates (id INTEGER PRIMARY KEY, fullName TEXT, email TEXT, phone TEXT, workAuthorization TEXT, availability TEXT, createdAt TEXT)`);
  db.close();
}

async function getJobs() {
  const db = openDb();
  const rows = await all(db, 'SELECT * FROM jobs');
  db.close();
  return rows;
}

async function getEmployers() {
  const db = openDb();
  const rows = await all(db, 'SELECT * FROM employers ORDER BY createdAt DESC');
  db.close();
  return rows;
}

async function createEmployer(data) {
  const db = openDb();
  const createdAt = new Date().toISOString();
  const res = await run(db, 'INSERT INTO employers (companyName,hiringManager,email,positionType,createdAt) VALUES (?,?,?,?,?)', [
    data.companyName,
    data.hiringManager,
    data.email,
    data.positionType,
    createdAt
  ]);
  db.close();
  return { id: res.lastID, ...data, createdAt };
}

async function getCandidates() {
  const db = openDb();
  const rows = await all(db, 'SELECT * FROM candidates ORDER BY createdAt DESC');
  db.close();
  return rows;
}

async function createCandidate(data) {
  const db = openDb();
  const createdAt = new Date().toISOString();
  const res = await run(db, 'INSERT INTO candidates (fullName,email,phone,workAuthorization,availability,createdAt) VALUES (?,?,?,?,?,?)', [
    data.fullName,
    data.email,
    data.phone,
    data.workAuthorization,
    data.availability,
    createdAt
  ]);
  db.close();
  return { id: res.lastID, ...data, createdAt };
}

module.exports = {
  init,
  getJobs,
  getEmployers,
  createEmployer,
  getCandidates,
  createCandidate
};
