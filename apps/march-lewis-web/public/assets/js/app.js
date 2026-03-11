const jobList = document.getElementById('jobList');
const employerForm = document.getElementById('employerForm');
const employerResult = document.getElementById('employerResult');
const candidateForm = document.getElementById('candidateForm');
const candidateResult = document.getElementById('candidateResult');
const candidateUploadForm = document.getElementById('candidateUploadForm');
const candidateUploadResult = document.getElementById('candidateUploadResult');
const employerUploadForm = document.getElementById('employerUploadForm');
const employerUploadResult = document.getElementById('employerUploadResult');
const marchLewisStats = document.getElementById('marchLewisStats');

async function getJson(url, options = {}) {
  const response = await fetch(url, options);
  const json = await response.json();
  if (!response.ok || !json.ok) throw new Error(json.message || json.error || 'Request failed');
  return json;
}

async function loadJobs() {
  if (!jobList) return;
  jobList.innerHTML = 'Loading jobs...';
  try {
    const json = await getJson('/api/march-lewis/jobs');
    if (!json.jobs.length) {
      jobList.innerHTML = '<div class="card"><p>No jobs posted yet.</p></div>';
      return;
    }
    jobList.innerHTML = json.jobs.map((job) => `
      <div class="card">
        <h3>${job.title || ''}</h3>
        <p>${job.type || ''} &mdash; ${job.location || ''}</p>
        <p>${job.description || ''}</p>
      </div>
    `).join('');
  } catch {
    jobList.innerHTML = '<div class="card"><p>Could not load jobs.</p></div>';
  }
}

async function loadDashboard() {
  if (!marchLewisStats) return;
  marchLewisStats.innerHTML = '<div class="card"><p>Login token required for admin metrics.</p></div>';
}

if (employerForm) {
  employerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    employerResult.className = 'result';
    const formData = Object.fromEntries(new FormData(employerForm));
    try {
      const json = await getJson('/api/march-lewis/employers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      employerResult.textContent = json.message || 'Employer intake submitted!';
      employerForm.reset();
    } catch (err) {
      employerResult.className = 'result error';
      employerResult.textContent = err.message || 'Submission failed.';
    }
  });
}

if (candidateForm) {
  candidateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    candidateResult.className = 'result';
    const formData = Object.fromEntries(new FormData(candidateForm));
    try {
      const json = await getJson('/api/march-lewis/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      candidateResult.textContent = json.message || 'Candidate onboarding submitted!';
      candidateForm.reset();
    } catch (err) {
      candidateResult.className = 'result error';
      candidateResult.textContent = err.message || 'Submission failed.';
    }
  });
}

if (candidateUploadForm) {
  candidateUploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    candidateUploadResult.className = 'result';
    const data = new FormData(candidateUploadForm);
    try {
      const response = await fetch('/api/uploads/candidate-document', { method: 'POST', body: data });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.error || 'Upload failed');
      candidateUploadResult.textContent = json.message || 'Uploaded!';
      candidateUploadForm.reset();
    } catch (err) {
      candidateUploadResult.className = 'result error';
      candidateUploadResult.textContent = err.message || 'Upload failed.';
    }
  });
}

if (employerUploadForm) {
  employerUploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    employerUploadResult.className = 'result';
    const data = new FormData(employerUploadForm);
    try {
      const response = await fetch('/api/uploads/employer-document', { method: 'POST', body: data });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.error || 'Upload failed');
      employerUploadResult.textContent = json.message || 'Uploaded!';
      employerUploadForm.reset();
    } catch (err) {
      employerUploadResult.className = 'result error';
      employerUploadResult.textContent = err.message || 'Upload failed.';
    }
  });
}

loadJobs();
loadDashboard();
