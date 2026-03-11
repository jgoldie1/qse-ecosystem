const jobs = [
  { id: 1, title: 'Administrative Assistant', type: 'Full-Time', location: 'Dallas, TX' },
  { id: 2, title: 'IT Support Specialist', type: 'Full-Time', location: 'Remote' },
  { id: 3, title: 'Healthcare Coordinator', type: 'Part-Time', location: 'Houston, TX' }
];

const employers = [];
const candidates = [];
let employerCounter = 0;
let candidateCounter = 0;

function getJobs() {
  return Promise.resolve(jobs);
}

function getEmployers() {
  return Promise.resolve(employers);
}

function createEmployer(data) {
  const employer = {
    id: ++employerCounter,
    ...data,
    createdAt: new Date().toISOString()
  };
  employers.push(employer);
  return Promise.resolve(employer);
}

function getCandidates() {
  return Promise.resolve(candidates);
}

function createCandidate(data) {
  const candidate = {
    id: ++candidateCounter,
    ...data,
    createdAt: new Date().toISOString()
  };
  candidates.push(candidate);
  return Promise.resolve(candidate);
}

module.exports = {
  getJobs,
  getEmployers,
  createEmployer,
  getCandidates,
  createCandidate
};
