const { all, run } = require('../db/sqlite');

async function getProviders() {
  return all(`SELECT * FROM sculptify_providers ORDER BY id DESC`);
}

async function getBookings() {
  return all(`SELECT * FROM sculptify_bookings ORDER BY id DESC`);
}

async function createBooking(data) {
  const now = new Date().toISOString();
  const result = await run(
    `INSERT INTO sculptify_bookings (full_name, email, service, session_type, date, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.fullName || '',
      data.email || '',
      data.service || '',
      data.sessionType || '',
      data.date || '',
      'pending',
      now
    ]
  );

  return {
    id: result.id,
    fullName: data.fullName || '',
    email: data.email || '',
    service: data.service || '',
    sessionType: data.sessionType || '',
    date: data.date || '',
    status: 'pending',
    createdAt: now
  };
}

async function getOnboarding() {
  return all(`SELECT * FROM sculptify_onboarding ORDER BY id DESC`);
}

async function createOnboarding(data) {
  const now = new Date().toISOString();
  const result = await run(
    `INSERT INTO sculptify_onboarding
    (full_name, email, phone, service_specialty, license_number, insurance_provider, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.fullName || '',
      data.email || '',
      data.phone || '',
      data.serviceSpecialty || '',
      data.licenseNumber || '',
      data.insuranceProvider || '',
      'submitted',
      now
    ]
  );

  return {
    id: result.id,
    fullName: data.fullName || '',
    email: data.email || '',
    phone: data.phone || '',
    serviceSpecialty: data.serviceSpecialty || '',
    licenseNumber: data.licenseNumber || '',
    insuranceProvider: data.insuranceProvider || '',
    status: 'submitted',
    createdAt: now
  };
}

module.exports = {
  getProviders,
  getBookings,
  createBooking,
  getOnboarding,
  createOnboarding
};
