/* March & Lewis — Recruiter Dashboard Page */

import { initHeader } from '../components/header.js';
import { initFooter } from '../components/footer.js';
import { requireSession, clearSession, ROLES } from '../forms/login-form.js';
import { getTasks, updateTask, deleteTask, getTrainingCourses } from '../api.js';

export function initRecruiterDashboardPage() {
  initHeader();
  initFooter();

  const session = requireSession();
  if (!session) return;

  // Allow both recruiter and admin roles
  if (session.role !== ROLES.RECRUITER && session.role !== ROLES.ADMIN) {
    window.location.href = '/march-lewis/login.html';
    return;
  }

  renderWelcome(session);
  initLogout();
  loadDashboardData();
}

function renderWelcome(session) {
  const el = document.getElementById('dashboard-welcome');
  if (el) el.textContent = `Welcome back, ${session.name}`;
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

async function loadDashboardData() {
  await Promise.all([loadApplications(), loadStats(), loadCourses()]);
}

async function loadStats() {
  const container = document.getElementById('recruiter-stats');
  if (!container) return;
  try {
    const tasks = await getTasks();
    const mlTasks = tasks.filter(t => t.app === 'marchLewis');
    const applications = mlTasks.filter(t => t.type === 'application');
    const employers = mlTasks.filter(t => t.type === 'employer-request');
    const candidates = mlTasks.filter(t => t.type === 'candidate-onboarding');
    const pending = mlTasks.filter(t => t.status === 'pending');

    container.innerHTML = `
      <div class="stat-card"><span class="stat-number">${applications.length}</span><span class="stat-label">Applications</span></div>
      <div class="stat-card"><span class="stat-number">${employers.length}</span><span class="stat-label">Employer Requests</span></div>
      <div class="stat-card"><span class="stat-number">${candidates.length}</span><span class="stat-label">Candidates</span></div>
      <div class="stat-card"><span class="stat-number">${pending.length}</span><span class="stat-label">Pending Review</span></div>
    `;
  } catch (_) {
    container.innerHTML = '<p class="loading">Could not load stats.</p>';
  }
}

async function loadApplications() {
  const tbody = document.getElementById('applications-tbody');
  if (!tbody) return;

  try {
    const tasks = await getTasks();
    const items = tasks.filter(t => t.app === 'marchLewis');

    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="table-empty">No submissions yet.</td></tr>';
      return;
    }

    tbody.innerHTML = items.map(task => `
      <tr data-task-id="${task.id}">
        <td>${escHtml(task.title)}</td>
        <td><span class="badge badge--${task.type || 'general'}">${formatType(task.type)}</span></td>
        <td>
          <select class="status-select" data-task-id="${task.id}">
            <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="reviewing" ${task.status === 'reviewing' ? 'selected' : ''}>Reviewing</option>
            <option value="accepted" ${task.status === 'accepted' ? 'selected' : ''}>Accepted</option>
            <option value="rejected" ${task.status === 'rejected' ? 'selected' : ''}>Rejected</option>
          </select>
        </td>
        <td>
          <button class="btn btn-outline btn-sm delete-task" data-task-id="${task.id}">Remove</button>
        </td>
      </tr>
    `).join('');

    // Status change handler
    tbody.addEventListener('change', async (e) => {
      const select = e.target.closest('.status-select');
      if (!select) return;
      const id = select.dataset.taskId;
      const status = select.value;
      try {
        await updateTask(id, { status });
        showToast(`Status updated to "${status}"`);
      } catch (_) {
        showToast('Could not update status.', 'error');
      }
    });

    // Delete handler
    tbody.addEventListener('click', async (e) => {
      const btn = e.target.closest('.delete-task');
      if (!btn) return;
      if (!confirm('Remove this entry?')) return;
      const id = btn.dataset.taskId;
      try {
        await deleteTask(id);
        btn.closest('tr').remove();
        showToast('Entry removed.');
      } catch (_) {
        showToast('Could not remove entry.', 'error');
      }
    });
  } catch (_) {
    tbody.innerHTML = '<tr><td colspan="4" class="table-empty">Could not load submissions.</td></tr>';
  }
}

async function loadCourses() {
  const container = document.getElementById('recruiter-courses');
  if (!container) return;
  try {
    const courses = await getTrainingCourses();
    const mlCourses = courses.filter(c => c.app === 'marchLewis' || c.app === 'general');
    if (!mlCourses.length) {
      container.innerHTML = '<p class="loading">No courses found.</p>';
      return;
    }
    container.innerHTML = mlCourses.map(c => `
      <div class="list-item">
        <span class="list-item-title">🎓 ${escHtml(c.title)}</span>
        <span class="list-item-meta">${escHtml(c.duration)}</span>
      </div>
    `).join('');
  } catch (_) {
    container.innerHTML = '<p class="loading">Could not load courses.</p>';
  }
}

function formatType(type) {
  const map = {
    'application': 'Application',
    'employer-request': 'Employer',
    'candidate-onboarding': 'Candidate',
    'general': 'General'
  };
  return map[type] || type || 'General';
}

function escHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast toast--${type} toast--visible`;
  setTimeout(() => toast.classList.remove('toast--visible'), 3000);
}

initRecruiterDashboardPage();
