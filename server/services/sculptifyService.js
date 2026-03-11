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
  await run(db, `CREATE TABLE IF NOT EXISTS providers (id INTEGER PRIMARY KEY, name TEXT, specialty TEXT)`);
  await run(db, `CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY, fullName TEXT, email TEXT, service TEXT, sessionType TEXT, date TEXT, createdAt TEXT)`);
  await run(db, `CREATE TABLE IF NOT EXISTS onboarding (id INTEGER PRIMARY KEY, fullName TEXT, email TEXT, phone TEXT, serviceSpecialty TEXT, licenseNumber TEXT, insuranceProvider TEXT, createdAt TEXT)`);
  db.close();
}

async function getProviders() {
  const db = openDb();
  const rows = await all(db, 'SELECT * FROM providers');
  db.close();
  return rows;
}

async function getBookings() {
  const db = openDb();
  const rows = await all(db, 'SELECT * FROM bookings ORDER BY createdAt DESC');
  db.close();
  return rows;
}

async function createBooking(data) {
  const db = openDb();
  const createdAt = new Date().toISOString();
  const res = await run(db, 'INSERT INTO bookings (fullName,email,service,sessionType,date,createdAt) VALUES (?,?,?,?,?,?)', [
    data.fullName,
    data.email,
    data.service,
    data.sessionType,
    data.date,
    createdAt
  ]);
  db.close();
  return { id: res.lastID, ...data, createdAt };
}

async function getOnboarding() {
  const db = openDb();
  const rows = await all(db, 'SELECT * FROM onboarding ORDER BY createdAt DESC');
  db.close();
  return rows;
}

async function createOnboarding(data) {
  const db = openDb();
  const createdAt = new Date().toISOString();
  const res = await run(
    db,
    'INSERT INTO onboarding (fullName,email,phone,serviceSpecialty,licenseNumber,insuranceProvider,createdAt) VALUES (?,?,?,?,?,?,?)',
    [data.fullName, data.email, data.phone, data.serviceSpecialty, data.licenseNumber || null, data.insuranceProvider || null, createdAt]
  );
  db.close();
  return { id: res.lastID, ...data, createdAt };
}

module.exports = {
  init,
  getProviders,
  getBookings,
  createBooking,
  getOnboarding,
  createOnboarding
};
