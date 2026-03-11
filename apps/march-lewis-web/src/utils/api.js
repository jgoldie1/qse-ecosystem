const fetchJson = require('../../../../shared/utils/fetchJson');

const MarchLewisAPI = {
  getJobs() {
    return fetchJson('/api/march-lewis/jobs');
  },
  getEmployers() {
    return fetchJson('/api/march-lewis/employers');
  },
  createEmployer(data) {
    return fetchJson('/api/march-lewis/employers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },
  getCandidates() {
    return fetchJson('/api/march-lewis/candidates');
  },
  createCandidate(data) {
    return fetchJson('/api/march-lewis/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },
  getInterviews() {
    return fetchJson('/api/scheduling/march-lewis-interviews');
  }
};

module.exports = MarchLewisAPI;
