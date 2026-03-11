const fs = require('fs');
const path = require('path');

const JOBS_PATH = path.join(__dirname, '../data/march-lewis-jobs.json');
const EMPLOYERS_PATH = path.join(__dirname, '../data/march-lewis-employers.json');
const CANDIDATES_PATH = path.join(__dirname, '../data/march-lewis-candidates.json');

function loadFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}

function saveFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

async function getJobs() {
  return loadFile(JOBS_PATH);
}

async function updateJob(id, data) {
  const jobs = loadFile(JOBS_PATH);
  const index = jobs.findIndex(j => j.id === id);
  if (index === -1) throw new Error('Job not found');
  jobs[index] = { ...jobs[index], ...data, id };
  saveFile(JOBS_PATH, jobs);
  return jobs[index];
}

async function getEmployers() {
  return loadFile(EMPLOYERS_PATH);
}

async function createEmployer(data) {
  const employers = loadFile(EMPLOYERS_PATH);
  const employer = {
    id: generateId(),
    companyName: data.companyName,
    hiringManager: data.hiringManager,
    email: data.email,
    positionType: data.positionType,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  employers.push(employer);
  saveFile(EMPLOYERS_PATH, employers);
  return employer;
}

async function getCandidates() {
  return loadFile(CANDIDATES_PATH);
}

async function createCandidate(data) {
  const candidates = loadFile(CANDIDATES_PATH);
  const candidate = {
    id: generateId(),
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    workAuthorization: data.workAuthorization,
    availability: data.availability,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  candidates.push(candidate);
  saveFile(CANDIDATES_PATH, candidates);
  return candidate;
}

module.exports = {
  getJobs,
  updateJob,
  getEmployers,
  createEmployer,
  getCandidates,
  createCandidate
};
