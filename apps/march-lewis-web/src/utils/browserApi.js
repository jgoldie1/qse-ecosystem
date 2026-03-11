(function () {
  async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    const json = await response.json();
    if (!response.ok || !json.ok) {
      throw new Error(json.message || 'Request failed');
    }
    return json;
  }

  window.MarchLewisBrowserAPI = {
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
    },
    login(data) {
      return fetchJson('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    },
    getAdminDashboard(token) {
      return fetchJson('/api/march-lewis-admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  };
})();
