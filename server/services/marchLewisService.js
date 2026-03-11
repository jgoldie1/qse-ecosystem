const { getDb } = require('../db/init');

function getJobs() {
  const db = getDb();
  return db.prepare('SELECT * FROM march_lewis_jobs ORDER BY id DESC').all();
}

function getEmployers() {
  const db = getDb();
  return db.prepare('SELECT * FROM march_lewis_employers ORDER BY id DESC').all();
}

function createEmployer(data) {
  const db = getDb();
  const { companyName, hiringManager, email, positionType, notes } = data;
  const result = db.prepare(
    'INSERT INTO march_lewis_employers (company_name, hiring_manager, email, position_type, notes) VALUES (?, ?, ?, ?, ?)'
  ).run(companyName, hiringManager, email, positionType, notes || null);
  return { id: result.lastInsertRowid, companyName, hiringManager, email, positionType };
}

function getCandidates() {
  const db = getDb();
  return db.prepare('SELECT * FROM march_lewis_candidates ORDER BY id DESC').all();
}

function createCandidate(data) {
  const db = getDb();
  const { fullName, email, phone, workAuthorization, availability, notes } = data;
  const result = db.prepare(
    'INSERT INTO march_lewis_candidates (full_name, email, phone, work_authorization, availability, notes) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(fullName, email, phone, workAuthorization, availability, notes || null);
  return { id: result.lastInsertRowid, fullName, email, phone, workAuthorization, availability };
}

module.exports = { getJobs, getEmployers, createEmployer, getCandidates, createCandidate };
