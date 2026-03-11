/* March & Lewis — Admin Dashboard Page */

import { initHeader } from '../components/header.js';
import { initFooter } from '../components/footer.js';
import { requireSession, clearSession, ROLES } from '../forms/login-form.js';
import { getTasks, getTrainingCourses, getHealth, getMemberships, getRewards } from '../api.js';

export function initAdminDashboardPage() {
  initHeader();
  initFooter();

  const session = requireSession();
  if (!session) return;

  if (session.role !== ROLES.ADMIN) {
    window.location.href = '/march-lewis/login.html';
    return;
  }

  renderWelcome(session);
  initLogout();
  loadAllData();
}

function renderWelcome(session) {
  const el = document.getElementById('admin-welcome');
  if (el) el.textContent = `Admin Panel — ${session.name}`;
}

function initLogout() {
  const btn = document.getElementById('logout-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      clearSession();
      window.location.href = '/march-lewis/login.html';
    });
  }
}

async function loadAllData() {
  await Promise.all([
    loadSystemHealth(),
    loadTaskStats(),
    loadAllTasks(),
    loadTrainingOverview(),
    loadMembershipsOverview()
  ]);
}

async function loadSystemHealth() {
  const container = document.getElementById('system-health');
  if (!container) return;
  try {
    const health = await getHealth();
    container.innerHTML = `
      <div class="health-badge health-badge--${health.status === 'ok' ? 'ok' : 'error'}">
        System Status: ${health.status === 'ok' ? '✓ Operational' : '✗ Issue Detected'}
      </div>
      ${health.uptime !== undefined ? `<p class="health-meta">Uptime: ${formatUptime(health.uptime)}</p>` : ''}
    `;
  } catch (_) {
    container.innerHTML = '<div class="health-badge health-badge--error">Could not reach API</div>';
  }
}

async function loadTaskStats() {
  const container = document.getElementById('admin-stats');
  if (!container) return;
  try {
    const tasks = await getTasks();
    const total = tasks.length;
    const mlTasks = tasks.filter(t => t.app === 'marchLewis');
    const pending = tasks.filter(t => t.status === 'pending').length;
    const applications = mlTasks.filter(t => t.type === 'application').length;
    const employers = mlTasks.filter(t => t.type === 'employer-request').length;
    const candidates = mlTasks.filter(t => t.type === 'candidate-onboarding').length;

    container.innerHTML = `
      <div class="stat-card"><span class="stat-number">${total}</span><span class="stat-label">Total Tasks</span></div>
      <div class="stat-card"><span class="stat-number">${pending}</span><span class="stat-label">Pending</span></div>
      <div class="stat-card"><span class="stat-number">${applications}</span><span class="stat-label">Applications</span></div>
      <div class="stat-card"><span class="stat-number">${employers}</span><span class="stat-label">Employer Requests</span></div>
      <div class="stat-card"><span class="stat-number">${candidates}</span><span class="stat-label">Candidates</span></div>
    `;
  } catch (_) {
    container.innerHTML = '<p class="loading">Could not load task stats.</p>';
  }
}

async function loadAllTasks() {
  const tbody = document.getElementById('admin-tasks-tbody');
  if (!tbody) return;
  try {
    const tasks = await getTasks();
    if (!tasks.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="table-empty">No tasks found.</td></tr>';
      return;
    }
    tbody.innerHTML = tasks.map(task => `
      <tr>
        <td>${escHtml(task.id || '—')}</td>
        <td>${escHtml(task.title)}</td>
        <td>${escHtml(task.app || '—')}</td>
        <td><span class="badge badge--${task.type || 'general'}">${escHtml(task.type || 'general')}</span></td>
        <td><span class="badge badge--status-${task.status || 'unknown'}">${escHtml(task.status || '—')}</span></td>
      </tr>
    `).join('');
  } catch (_) {
    tbody.innerHTML = '<tr><td colspan="5" class="table-empty">Could not load tasks.</td></tr>';
  }
}

async function loadTrainingOverview() {
  const container = document.getElementById('training-overview');
  if (!container) return;
  try {
    const courses = await getTrainingCourses();
    const byApp = courses.reduce((acc, c) => {
      acc[c.app] = (acc[c.app] || 0) + 1;
      return acc;
    }, {});
    container.innerHTML = `
      <p class="overview-total">${courses.length} total course${courses.length !== 1 ? 's' : ''}</p>
      <ul class="overview-list">
        ${Object.entries(byApp).map(([app, count]) => `<li><strong>${count}</strong> ${app}</li>`).join('')}
      </ul>
    `;
  } catch (_) {
    container.innerHTML = '<p class="loading">Could not load training data.</p>';
  }
}

async function loadMembershipsOverview() {
  const container = document.getElementById('memberships-overview');
  if (!container) return;
  try {
    const memberships = await getMemberships();
    const count = Array.isArray(memberships) ? memberships.length : '—';
    container.innerHTML = `<p class="overview-total">${count} membership record${count !== 1 ? 's' : ''}</p>`;
  } catch (_) {
    container.innerHTML = '<p class="loading">Could not load membership data.</p>';
  }
}

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function escHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

initAdminDashboardPage();
