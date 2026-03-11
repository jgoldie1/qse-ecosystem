/**
 * adminLogin – handles admin authentication and dashboard rendering
 */

export function initAdminLogin(apiBase) {
  const loginSection = document.getElementById('admin-login-section');
  const dashboardSection = document.getElementById('admin-dashboard-section');
  const loginForm = document.getElementById('admin-login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;
    const status = document.getElementById('admin-login-status');

    try {
      const res = await fetch(`${apiBase}/march-lewis/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const result = await res.json();

      if (result.success) {
        sessionStorage.setItem('ml-admin-token', result.token);
        showDashboard(loginSection, dashboardSection);
        loadDashboard(apiBase, result.token);
      } else {
        status.style.color = '#f87171';
        status.textContent = 'Invalid credentials.';
      }
    } catch {
      status.style.color = '#f87171';
      status.textContent = 'Login failed. Please try again.';
    }
  });

  // Restore existing session on page load
  const saved = sessionStorage.getItem('ml-admin-token');
  if (saved) {
    loadDashboard(apiBase, saved).then(ok => {
      if (ok) {
        showDashboard(loginSection, dashboardSection);
      } else {
        sessionStorage.removeItem('ml-admin-token');
      }
    });
  }
}

function showDashboard(loginSection, dashboardSection) {
  if (loginSection) loginSection.style.display = 'none';
  if (dashboardSection) dashboardSection.style.display = 'block';
}

export async function loadDashboard(apiBase, token) {
  const el = document.getElementById('admin-dashboard-content');
  if (!el) return false;

  try {
    const res = await fetch(`${apiBase}/march-lewis/admin/dashboard`, {
      headers: { 'x-admin-token': token }
    });
    if (!res.ok) return false;

    const data = await res.json();
    el.innerHTML = renderDashboard(data);

    document.getElementById('admin-logout')?.addEventListener('click', () => {
      sessionStorage.removeItem('ml-admin-token');
      const loginSection = document.getElementById('admin-login-section');
      const dashboardSection = document.getElementById('admin-dashboard-section');
      if (dashboardSection) dashboardSection.style.display = 'none';
      if (loginSection) loginSection.style.display = '';
    });

    return true;
  } catch {
    return false;
  }
}

function renderDashboard(data) {
  const { summary, recentCandidates, recentEmployers } = data;

  const candidateRows = recentCandidates.length
    ? recentCandidates.map(c => `
        <li>
          <span>${c.title}</span>
          <span class="dash-date">${new Date(c.createdAt).toLocaleDateString()}</span>
        </li>`).join('')
    : '<li class="loading">No candidates yet.</li>';

  const employerRows = recentEmployers.length
    ? recentEmployers.map(e => `
        <li>
          <span>${e.title}</span>
          <span class="dash-date">${new Date(e.createdAt).toLocaleDateString()}</span>
        </li>`).join('')
    : '<li class="loading">No employer requests yet.</li>';

  return `
    <div class="stats">
      <div class="stat-card">
        <span class="stat-number">${summary.candidates}</span>
        <span class="stat-label">Candidates</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">${summary.employers}</span>
        <span class="stat-label">Employers</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">${summary.applications}</span>
        <span class="stat-label">Applications</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">${summary.jobs}</span>
        <span class="stat-label">Open Jobs</span>
      </div>
    </div>
    <div class="dashboard-panels">
      <div class="dashboard-panel">
        <h3>Recent Candidates</h3>
        <ul class="dashboard-list">${candidateRows}</ul>
      </div>
      <div class="dashboard-panel">
        <h3>Recent Employer Requests</h3>
        <ul class="dashboard-list">${employerRows}</ul>
      </div>
    </div>
    <button class="btn btn-outline" id="admin-logout" style="margin-top:20px;">Log Out</button>
  `;
}
