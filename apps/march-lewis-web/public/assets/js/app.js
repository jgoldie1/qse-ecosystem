const employerForm = document.getElementById('employerForm');
const employerResult = document.getElementById('employerResult');
const candidateForm = document.getElementById('candidateForm');
const candidateResult = document.getElementById('candidateResult');
const candidateUploadForm = document.getElementById('candidateUploadForm');
const candidateUploadResult = document.getElementById('candidateUploadResult');
const employerUploadForm = document.getElementById('employerUploadForm');
const employerUploadResult = document.getElementById('employerUploadResult');
const marchLewisStats = document.getElementById('marchLewisStats');
const jobList = document.getElementById('jobList');

async function getJson(url, options) {
  const response = await fetch(url, options);
  const json = await response.json();
  if (!response.ok || !json.ok) {
    throw new Error(json.message || 'Request failed');
  }
  return json;
}

async function loadJobs() {
  if (!jobList) return;
  jobList.innerHTML = 'Loading jobs...';

  try {
    const json = await getJson('/api/march-lewis/jobs');
    if (!json.jobs.length) {
      jobList.innerHTML = '<div class="card"><p>No jobs yet.</p></div>';
      return;
    }

    jobList.innerHTML = json.jobs.map((job) => `
      <div class="card">
        <h3>${job.title || ''}</h3>
        <p>${job.type || ''}</p>
        <span>${job.location || ''}</span>
      </div>
    `).join('');
  } catch (_error) {
    jobList.innerHTML = '<div class="card"><p>Could not load jobs.</p></div>';
  }
}

async function loadDashboard() {
  if (!marchLewisStats) return;
  marchLewisStats.innerHTML = 'Loading dashboard...';

  try {
    const json = await getJson('/api/march-lewis-admin/dashboard');
    marchLewisStats.innerHTML = `
      <div class="card"><h3>Jobs</h3><p>${json.metrics.jobs}</p></div>
      <div class="card"><h3>Employers</h3><p>${json.metrics.employers}</p></div>
      <div class="card"><h3>Candidates</h3><p>${json.metrics.candidates}</p></div>
    `;
  } catch (_error) {
    marchLewisStats.innerHTML = '<div class="card"><p>Could not load dashboard.</p></div>';
  }
}

if (employerForm) {
  employerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(employerForm).entries());
    employerResult.textContent = 'Submitting...';

    try {
      const json = await getJson('/api/march-lewis/employers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      employerResult.textContent = json.message;
      employerForm.reset();
      loadDashboard();
    } catch (error) {
      employerResult.textContent = error.message;
    }
  });
}

if (candidateForm) {
  candidateForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(candidateForm).entries());
    candidateResult.textContent = 'Submitting...';

    try {
      const json = await getJson('/api/march-lewis/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      candidateResult.textContent = json.message;
      candidateForm.reset();
      loadDashboard();
    } catch (error) {
      candidateResult.textContent = error.message;
    }
  });
}

if (candidateUploadForm) {
  candidateUploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    candidateUploadResult.textContent = 'Uploading...';

    try {
      const formData = new FormData(candidateUploadForm);
      const response = await fetch('/api/uploads/candidate-document', {
        method: 'POST',
        body: formData
      });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.message || 'Upload failed');
      candidateUploadResult.textContent = json.message;
      candidateUploadForm.reset();
    } catch (error) {
      candidateUploadResult.textContent = error.message;
    }
  });
}

if (employerUploadForm) {
  employerUploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    employerUploadResult.textContent = 'Uploading...';

    try {
      const formData = new FormData(employerUploadForm);
      const response = await fetch('/api/uploads/employer-document', {
        method: 'POST',
        body: formData
      });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.message || 'Upload failed');
      employerUploadResult.textContent = json.message;
      employerUploadForm.reset();
    } catch (error) {
      employerUploadResult.textContent = error.message;
    }
  });
}

loadJobs();
loadDashboard();
