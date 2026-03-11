const { run, all, get } = require('../db/sqlite');

async function init() {
  // Schema is managed by migrate.js; nothing to do here
}

async function getJobs() {
  return [
    { id: 1, title: 'Medical Courier', type: 'Full-Time', location: 'Houston, TX' },
    { id: 2, title: 'Warehouse Associate', type: 'Part-Time', location: 'Nashville, TN' },
    { id: 3, title: 'Logistics Coordinator', type: 'Contract', location: 'Remote' }
  ];
}

async function getEmployers() {
  return all('SELECT * FROM march_lewis_employers ORDER BY created_at DESC');
}

async function createEmployer(data) {
  const createdAt = new Date().toISOString();
  const result = await run(
    'INSERT INTO march_lewis_employers (company_name, hiring_manager, email, position_type, created_at) VALUES (?, ?, ?, ?, ?)',
    [data.companyName, data.hiringManager, data.email, data.positionType, createdAt]
  );
  return get('SELECT * FROM march_lewis_employers WHERE id = ?', [result.lastID]);
}

async function getCandidates() {
  return all('SELECT * FROM march_lewis_candidates ORDER BY created_at DESC');
}

async function createCandidate(data) {
  const createdAt = new Date().toISOString();
  const result = await run(
    'INSERT INTO march_lewis_candidates (full_name, email, phone, work_authorization, availability, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [data.fullName, data.email, data.phone, data.workAuthorization, data.availability, createdAt]
  );
  return get('SELECT * FROM march_lewis_candidates WHERE id = ?', [result.lastID]);
}

module.exports = { init, getJobs, getEmployers, createEmployer, getCandidates, createCandidate };
