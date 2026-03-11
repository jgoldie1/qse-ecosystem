const bcrypt = require('bcrypt');
const { run, get } = require('./sqlite');

async function migrate() {
  await run('PRAGMA foreign_keys = ON');

  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer',
      created_at TEXT NOT NULL,
      updated_at TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS sculptify_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      service TEXT NOT NULL,
      session_type TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS sculptify_onboarding (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      service_specialty TEXT NOT NULL,
      license_number TEXT,
      insurance_provider TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS march_lewis_employers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      hiring_manager TEXT NOT NULL,
      email TEXT NOT NULL,
      position_type TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS march_lewis_candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      work_authorization TEXT NOT NULL,
      availability TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS uploads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_email TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details_json TEXT,
      created_at TEXT NOT NULL
    )
  `);

  // Seed default admin if absent
  const admin = await get('SELECT id FROM users WHERE email = ?', ['admin@qse.local']);
  if (!admin) {
    const passwordHash = await bcrypt.hash('ChangeMe123!', 10);
    await run(
      'INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)',
      ['QSE Admin', 'admin@qse.local', passwordHash, 'admin', new Date().toISOString()]
    );
    console.log('Default admin user created: admin@qse.local / ChangeMe123!');
  }

  console.log('Database migration complete');
}

module.exports = { migrate };
