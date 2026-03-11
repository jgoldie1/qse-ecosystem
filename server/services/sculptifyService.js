const { getDb } = require('../db/init');

function getProviders() {
  const db = getDb();
  return db.prepare('SELECT * FROM sculptify_providers ORDER BY id DESC').all();
}

function getBookings() {
  const db = getDb();
  return db.prepare('SELECT * FROM sculptify_bookings ORDER BY id DESC').all();
}

function createBooking(data) {
  const db = getDb();
  const { fullName, email, service, sessionType, date, notes } = data;
  const result = db.prepare(
    'INSERT INTO sculptify_bookings (full_name, email, service, session_type, date, notes) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(fullName, email, service, sessionType, date, notes || null);
  return { id: result.lastInsertRowid, fullName, email, service, sessionType, date };
}

function getOnboarding() {
  const db = getDb();
  return db.prepare('SELECT * FROM sculptify_onboarding ORDER BY id DESC').all();
}

function createOnboarding(data) {
  const db = getDb();
  const { fullName, email, phone, serviceSpecialty, licenseNumber, insuranceProvider } = data;
  const result = db.prepare(
    'INSERT INTO sculptify_onboarding (full_name, email, phone, service_specialty, license_number, insurance_provider) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(fullName, email, phone, serviceSpecialty, licenseNumber || null, insuranceProvider || null);
  return { id: result.lastInsertRowid, fullName, email, phone, serviceSpecialty };
}

module.exports = { getProviders, getBookings, createBooking, getOnboarding, createOnboarding };
