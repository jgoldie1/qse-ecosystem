const { all, run } = require('../db/sqlite');

async function getJobs() {
  return all(`SELECT * FROM march_lewis_jobs ORDER BY id DESC`);
}

async function getEmployers() {
  return all(`SELECT * FROM march_lewis_employers ORDER BY id DESC`);
}

async function createEmployer(data) {
  const now = new Date().toISOString();
  const result = await run(
    `INSERT INTO march_lewis_employers
    (company_name, hiring_manager, email, position_type, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.companyName || '',
      data.hiringManager || '',
      data.email || '',
      data.positionType || '',
      'submitted',
      now
    ]
  );

  return {
    id: result.id,
    companyName: data.companyName || '',
    hiringManager: data.hiringManager || '',
    email: data.email || '',
    positionType: data.positionType || '',
    status: 'submitted',
    createdAt: now
  };
}

async function getCandidates() {
  return all(`SELECT * FROM march_lewis_candidates ORDER BY id DESC`);
}

async function createCandidate(data) {
  const now = new Date().toISOString();
  const result = await run(
    `INSERT INTO march_lewis_candidates
    (full_name, email, phone, work_authorization, availability, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.fullName || '',
      data.email || '',
      data.phone || '',
      data.workAuthorization || '',
      data.availability || '',
      'submitted',
      now
    ]
  );

  return {
    id: result.id,
    fullName: data.fullName || '',
    email: data.email || '',
    phone: data.phone || '',
    workAuthorization: data.workAuthorization || '',
    availability: data.availability || '',
    status: 'submitted',
    createdAt: now
  };
}

module.exports = {
  getJobs,
  getEmployers,
  createEmployer,
  getCandidates,
  createCandidate
};
