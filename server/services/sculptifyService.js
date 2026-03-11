const { run, all, get } = require('../db/sqlite');

async function init() {
  // Schema is managed by migrate.js; nothing to do here
}

async function getProviders() {
  return [
    { id: 1, name: 'Ava Brooks', specialty: 'Body Sculpting', mode: 'In-Person' },
    { id: 2, name: 'Maya Reed', specialty: 'Massage Therapy', mode: 'Virtual + In-Person' },
    { id: 3, name: 'Noah Lane', specialty: 'Reiki / Acupressure', mode: 'Virtual' }
  ];
}

async function getBookings() {
  return all('SELECT * FROM sculptify_bookings ORDER BY created_at DESC');
}

async function createBooking(data) {
  const createdAt = new Date().toISOString();
  const result = await run(
    'INSERT INTO sculptify_bookings (full_name, email, service, session_type, date, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [data.fullName, data.email, data.service, data.sessionType, data.date, createdAt]
  );
  return get('SELECT * FROM sculptify_bookings WHERE id = ?', [result.lastID]);
}

async function getOnboarding() {
  return all('SELECT * FROM sculptify_onboarding ORDER BY created_at DESC');
}

async function createOnboarding(data) {
  const createdAt = new Date().toISOString();
  const result = await run(
    `INSERT INTO sculptify_onboarding
      (full_name, email, phone, service_specialty, license_number, insurance_provider, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.fullName,
      data.email,
      data.phone,
      data.serviceSpecialty,
      data.licenseNumber || null,
      data.insuranceProvider || null,
      createdAt
    ]
  );
  return get('SELECT * FROM sculptify_onboarding WHERE id = ?', [result.lastID]);
}

module.exports = { init, getProviders, getBookings, createBooking, getOnboarding, createOnboarding };
