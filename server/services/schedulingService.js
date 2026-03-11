const { all, run } = require('../db/sqlite');

async function getAvailability() {
  return all(`SELECT * FROM sculptify_availability ORDER BY id DESC`);
}

async function createAvailability(data) {
  const now = new Date().toISOString();
  const result = await run(
    `INSERT INTO sculptify_availability
    (provider_name, service, slot_date, slot_time, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.providerName || '',
      data.service || '',
      data.slotDate || '',
      data.slotTime || '',
      'open',
      now
    ]
  );

  return {
    id: result.id,
    providerName: data.providerName || '',
    service: data.service || '',
    slotDate: data.slotDate || '',
    slotTime: data.slotTime || '',
    status: 'open',
    createdAt: now
  };
}

async function getInterviews() {
  return all(`SELECT * FROM march_lewis_interviews ORDER BY id DESC`);
}

async function createInterview(data) {
  const now = new Date().toISOString();
  const result = await run(
    `INSERT INTO march_lewis_interviews
    (candidate_name, company_name, interview_date, interview_time, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.candidateName || '',
      data.companyName || '',
      data.interviewDate || '',
      data.interviewTime || '',
      'scheduled',
      now
    ]
  );

  return {
    id: result.id,
    candidateName: data.candidateName || '',
    companyName: data.companyName || '',
    interviewDate: data.interviewDate || '',
    interviewTime: data.interviewTime || '',
    status: 'scheduled',
    createdAt: now
  };
}

module.exports = {
  getAvailability,
  createAvailability,
  getInterviews,
  createInterview
};
