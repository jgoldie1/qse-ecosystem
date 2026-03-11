const form = document.getElementById('adminLoginForm');
const result = document.getElementById('adminLoginResult');
const sessionStatus = document.getElementById('sessionStatus');
const stats = document.getElementById('adminStats');
const latest = document.getElementById('adminLatest');
const logoutBtn = document.getElementById('logoutBtn');
const TOKEN_KEY = 'qse_march_lewis_admin_token';

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function renderSession() {
  const token = getToken();
  sessionStatus.innerHTML = token
    ? '<p>Admin token saved in browser.</p>'
    : '<p>No admin token saved.</p>';
}

async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const json = await response.json();
  if (!response.ok || !json.ok) throw new Error(json.message || 'Login failed');
  return json;
}

async function loadDashboard() {
  const token = getToken();
  if (!token) {
    stats.innerHTML = '<div class="card"><p>Login required.</p></div>';
    latest.innerHTML = '';
    return;
  }

  try {
    const response = await fetch('/api/march-lewis-admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await response.json();
    if (!response.ok || !json.ok) throw new Error(json.message || 'Dashboard failed');

    stats.innerHTML = `
      <div class="card"><h3>Jobs</h3><p>${escapeHtml(json.metrics.jobs)}</p></div>
      <div class="card"><h3>Employers</h3><p>${escapeHtml(json.metrics.employers)}</p></div>
      <div class="card"><h3>Candidates</h3><p>${escapeHtml(json.metrics.candidates)}</p></div>
    `;

    latest.innerHTML = `
      <div class="card">
        <h3>Latest Employer</h3>
        <p>${json.latest.employer ? escapeHtml(json.latest.employer.company_name || json.latest.employer.companyName || 'Recorded') : 'None yet'}</p>
      </div>
      <div class="card">
        <h3>Latest Candidate</h3>
        <p>${json.latest.candidate ? escapeHtml(json.latest.candidate.full_name || json.latest.candidate.fullName || 'Recorded') : 'None yet'}</p>
      </div>
    `;
  } catch (error) {
    stats.innerHTML = `<div class="card"><p>${escapeHtml(error.message)}</p></div>`;
    latest.innerHTML = '';
  }
}

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    result.textContent = 'Logging in...';
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const json = await login(data.email, data.password);
      setToken(json.token);
      result.textContent = 'Login successful.';
      renderSession();
      loadDashboard();
    } catch (error) {
      result.textContent = error.message;
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    clearToken();
    result.textContent = 'Logged out.';
    renderSession();
    loadDashboard();
  });
}

renderSession();
loadDashboard();
