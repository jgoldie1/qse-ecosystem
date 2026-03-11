/* Sculptify Admin JS */

const API_BASE = '/api';
const DASHBOARD_URL = `${API_BASE}/sculptify-admin/dashboard`;
const LOGIN_URL = `${API_BASE}/auth/login`;
const TOKEN_KEY = 'sculptify_admin_token';

function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.error || `HTTP ${res.status}`), { status: res.status });
  return data;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


  const el = document.getElementById('sessionStatus');
  const token = getToken();
  if (token) {
    el.innerHTML = '<span class="text-success">&#10003; Logged in</span>';
  } else {
    el.innerHTML = '<span class="text-muted">Not logged in</span>';
  }
}

function setLoginResult(msg, isError) {
  const el = document.getElementById('adminLoginResult');
  el.textContent = msg;
  el.className = `result ${isError ? 'text-error' : 'text-success'}`;
}

async function loadDashboard() {
  const token = getToken();
  if (!token) return;

  const statsEl = document.getElementById('adminStats');
  const latestEl = document.getElementById('adminLatest');

  try {
    const data = await fetchJSON(DASHBOARD_URL, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const { metrics, latest } = data;

    statsEl.innerHTML = [
      { label: 'Providers', value: metrics.providers },
      { label: 'Bookings', value: metrics.bookings },
      { label: 'Onboarding', value: metrics.onboarding }
    ].map(s => `
      <div class="stat-card">
        <span class="stat-value">${s.value}</span>
        <span class="stat-label">${s.label}</span>
      </div>
    `).join('');

    const latestItems = [];
    if (latest.booking) {
      latestItems.push(`<div class="activity-card"><strong>Booking:</strong> ${escapeHtml(latest.booking.title || JSON.stringify(latest.booking))}</div>`);
    }
    if (latest.onboarding) {
      latestItems.push(`<div class="activity-card"><strong>Onboarding:</strong> ${escapeHtml(JSON.stringify(latest.onboarding))}</div>`);
    }
    latestEl.innerHTML = latestItems.length
      ? latestItems.join('')
      : '<p class="text-muted">No recent activity.</p>';
  } catch (err) {
    if (err.status === 401 || err.status === 403) {
      clearToken();
      updateSessionStatus();
      statsEl.innerHTML = '<p class="text-error">Session expired. Please log in again.</p>';
    } else {
      statsEl.innerHTML = `<p class="text-error">Could not load dashboard: ${err.message}</p>`;
    }
    latestEl.innerHTML = '';
  }
}

document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const email = form.email.value.trim();
  const password = form.password.value;

  try {
    const data = await fetchJSON(LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    setToken(data.token);
    setLoginResult('Login successful!', false);
    updateSessionStatus();
    loadDashboard();
  } catch (err) {
    setLoginResult(err.message || 'Login failed.', true);
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  clearToken();
  updateSessionStatus();
  document.getElementById('adminStats').innerHTML = '';
  document.getElementById('adminLatest').innerHTML = '';
  document.getElementById('adminLoginResult').textContent = '';
});

// Initialize
updateSessionStatus();
if (getToken()) {
  loadDashboard();
}
