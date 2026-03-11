/**
 * Sculptify Service - SQLite-backed data layer for Sculptify
 */

const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '../../data/sculptify.db');

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialty TEXT,
    mode TEXT,
    createdAt TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT NOT NULL,
    email TEXT NOT NULL,
    service TEXT NOT NULL,
    sessionType TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    createdAt TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS onboarding (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullName TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    serviceSpecialty TEXT NOT NULL,
    licenseNumber TEXT,
    insuranceProvider TEXT,
    status TEXT DEFAULT 'pending',
    createdAt TEXT DEFAULT (datetime('now'))
  );
`);

function getProviders() {
  return db.prepare('SELECT * FROM providers ORDER BY createdAt DESC').all();
}

function getBookings() {
  return db.prepare('SELECT * FROM bookings ORDER BY createdAt DESC').all();
}

function createBooking(data) {
  const { fullName, email, service, sessionType, date } = data;
  const stmt = db.prepare(
    'INSERT INTO bookings (fullName, email, service, sessionType, date) VALUES (?, ?, ?, ?, ?)'
  );
  const result = stmt.run(fullName, email, service, sessionType, date);
  return { id: result.lastInsertRowid, fullName, email, service, sessionType, date, status: 'pending' };
}

function getOnboarding() {
  return db.prepare('SELECT * FROM onboarding ORDER BY createdAt DESC').all();
}

function createOnboarding(data) {
  const { fullName, email, phone, serviceSpecialty, licenseNumber, insuranceProvider } = data;
  const stmt = db.prepare(
    'INSERT INTO onboarding (fullName, email, phone, serviceSpecialty, licenseNumber, insuranceProvider) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(fullName, email, phone, serviceSpecialty, licenseNumber || null, insuranceProvider || null);
  return { id: result.lastInsertRowid, fullName, email, phone, serviceSpecialty, status: 'pending' };
}

function getDashboardMetrics() {
  const providers = db.prepare('SELECT COUNT(*) as count FROM providers').get().count;
  const bookings = db.prepare('SELECT COUNT(*) as count FROM bookings').get().count;
  const onboarding = db.prepare('SELECT COUNT(*) as count FROM onboarding').get().count;
  return { providers, bookings, onboarding };
}

module.exports = {
  getProviders,
  getBookings,
  createBooking,
  getOnboarding,
  createOnboarding,
  getDashboardMetrics
};
