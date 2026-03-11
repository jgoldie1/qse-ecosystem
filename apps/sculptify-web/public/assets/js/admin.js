const form = document.getElementById('adminLoginForm');
const result = document.getElementById('adminLoginResult');
const sessionStatus = document.getElementById('sessionStatus');
const stats = document.getElementById('adminStats');
const latest = document.getElementById('adminLatest');
const logoutBtn = document.getElementById('logoutBtn');
const TOKEN_KEY = 'qse_sculptify_admin_token';

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
    const response = await fetch('/api/sculptify-admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await response.json();
    if (!response.ok || !json.ok) throw new Error(json.message || 'Dashboard failed');

    stats.innerHTML = `
      <div class="card"><h3>Providers</h3><p>${escapeHtml(json.metrics.providers)}</p></div>
      <div class="card"><h3>Bookings</h3><p>${escapeHtml(json.metrics.bookings)}</p></div>
      <div class="card"><h3>Onboarding</h3><p>${escapeHtml(json.metrics.onboarding)}</p></div>
    `;

    latest.innerHTML = `
      <div class="card">
        <h3>Latest Booking</h3>
        <p>${json.latest.booking ? escapeHtml(json.latest.booking.full_name || json.latest.booking.fullName || 'Recorded') : 'None yet'}</p>
      </div>
      <div class="card">
        <h3>Latest Onboarding</h3>
        <p>${json.latest.onboarding ? escapeHtml(json.latest.onboarding.full_name || json.latest.onboarding.fullName || 'Recorded') : 'None yet'}</p>
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
