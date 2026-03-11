const bcrypt = require('bcryptjs');
const { run, get } = require('./sqlite');

async function createTables() {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      platform TEXT DEFAULT 'general',
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS sculptify_providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      specialty TEXT,
      mode TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS sculptify_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT,
      email TEXT,
      service TEXT,
      session_type TEXT,
      date TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS sculptify_onboarding (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT,
      email TEXT,
      phone TEXT,
      service_specialty TEXT,
      license_number TEXT,
      insurance_provider TEXT,
      status TEXT DEFAULT 'submitted',
      created_at TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS march_lewis_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT,
      location TEXT,
      status TEXT DEFAULT 'open',
      created_at TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS march_lewis_employers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT,
      hiring_manager TEXT,
      email TEXT,
      position_type TEXT,
      status TEXT DEFAULT 'submitted',
      created_at TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS march_lewis_candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT,
      email TEXT,
      phone TEXT,
      work_authorization TEXT,
      availability TEXT,
      status TEXT DEFAULT 'submitted',
      created_at TEXT NOT NULL
    )
  `);
}

async function seedIfEmpty() {
  const now = new Date().toISOString();

  const admin = await get(`SELECT id FROM users WHERE email = ?`, ['admin@qse.local']);
  if (!admin) {
    const hash = await bcrypt.hash('Admin123!', 10);
    await run(
      `INSERT INTO users (email, password_hash, role, platform, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['admin@qse.local', hash, 'admin', 'qse-core', 'active', now]
    );
  }

  const providerCheck = await get(`SELECT id FROM sculptify_providers LIMIT 1`);
  if (!providerCheck) {
    await run(`INSERT INTO sculptify_providers (name, specialty, mode, status, created_at) VALUES (?, ?, ?, ?, ?)`,
      ['Monique R.', 'Body Sculpting', 'Virtual + In-Person', 'active', now]);
    await run(`INSERT INTO sculptify_providers (name, specialty, mode, status, created_at) VALUES (?, ?, ?, ?, ?)`,
      ['Danielle T.', 'Massage Therapy', 'In-Person', 'active', now]);
    await run(`INSERT INTO sculptify_providers (name, specialty, mode, status, created_at) VALUES (?, ?, ?, ?, ?)`,
      ['Priya S.', 'Reiki + Acupressure', 'Virtual + In-Person', 'active', now]);
  }

  const jobCheck = await get(`SELECT id FROM march_lewis_jobs LIMIT 1`);
  if (!jobCheck) {
    await run(`INSERT INTO march_lewis_jobs (title, type, location, status, created_at) VALUES (?, ?, ?, ?, ?)`,
      ['Logistics Coordinator', 'Full-Time', 'Remote/Hybrid', 'open', now]);
    await run(`INSERT INTO march_lewis_jobs (title, type, location, status, created_at) VALUES (?, ?, ?, ?, ?)`,
      ['Healthcare Recruiter', 'Contract', 'Remote', 'open', now]);
    await run(`INSERT INTO march_lewis_jobs (title, type, location, status, created_at) VALUES (?, ?, ?, ?, ?)`,
      ['Workforce Specialist', 'Full-Time', 'Onsite', 'open', now]);
  }
}

async function initDatabase() {
  await createTables();
  await seedIfEmpty();
}

module.exports = { initDatabase };
