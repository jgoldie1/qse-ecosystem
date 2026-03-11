const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'qse.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

async function initDatabase() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sculptify_providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      specialty TEXT,
      mode TEXT,
      bio TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sculptify_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      service TEXT NOT NULL,
      session_type TEXT NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sculptify_onboarding (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      service_specialty TEXT NOT NULL,
      license_number TEXT,
      insurance_provider TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS march_lewis_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      location TEXT,
      type TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS march_lewis_employers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      hiring_manager TEXT NOT NULL,
      email TEXT NOT NULL,
      position_type TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS march_lewis_candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      work_authorization TEXT NOT NULL,
      availability TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const existingAdmin = database.prepare('SELECT id FROM users WHERE email = ?').get('admin@qse.local');
  if (!existingAdmin) {
    const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'Admin123!';
    if (!process.env.ADMIN_SEED_PASSWORD) {
      console.warn('[db] WARNING: ADMIN_SEED_PASSWORD not set. Using default seed password "Admin123!". Change this in production.');
    }
    const hashed = await bcrypt.hash(adminPassword, 12);
    database.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)').run('admin@qse.local', hashed, 'admin');
  }

  const providerCount = database.prepare('SELECT COUNT(*) AS count FROM sculptify_providers').get();
  if (providerCount.count === 0) {
    const insertProvider = database.prepare('INSERT INTO sculptify_providers (name, specialty, mode) VALUES (?, ?, ?)');
    insertProvider.run('Dr. Alicia Monroe', 'Body Sculpting', 'In-Person');
    insertProvider.run('Marcus Lee', 'Massage Therapy', 'Virtual & In-Person');
    insertProvider.run('Sana Patel', 'Reiki & Acupuncture', 'Virtual');
  }

  const jobCount = database.prepare('SELECT COUNT(*) AS count FROM march_lewis_jobs').get();
  if (jobCount.count === 0) {
    const insertJob = database.prepare('INSERT INTO march_lewis_jobs (title, location, type, description) VALUES (?, ?, ?, ?)');
    insertJob.run('Administrative Assistant', 'Dallas, TX', 'Full-Time', 'Support executive team with scheduling and communications.');
    insertJob.run('IT Support Specialist', 'Remote', 'Full-Time', 'Provide technical support and system maintenance.');
    insertJob.run('Healthcare Coordinator', 'Houston, TX', 'Part-Time', 'Coordinate patient appointments and records.');
  }
}

module.exports = { getDb, initDatabase };
