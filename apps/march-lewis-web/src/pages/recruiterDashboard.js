/* March & Lewis — Recruiter dashboard page */

import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { fetchJSON, API_BASE, getSession } from '../api/client.js';
import { showToast } from '../components/toast.js';

/* Auth guard */
const session = getSession();
if (!session || (session.role !== 'recruiter' && session.role !== 'admin')) {
  window.location.href = '/march-lewis/login.html';
}

mountHeader('dashboard');
mountFooter();

/* Personalise greeting */
const nameEl = document.getElementById('recruiter-name');
if (nameEl) nameEl.textContent = session?.name || 'Recruiter';

const userId = session?.userId || 'demo-recruiter';

/* ── Load dashboard data ── */
async function loadDashboard() {
  try {
    const tasks        = await fetchJSON(`${API_BASE}/tasks`);
    const mlTasks      = tasks.filter((t) => t.app === 'marchLewis');
    const applications = mlTasks.filter((t) => t.type === 'application');
    const empRequests  = mlTasks.filter((t) => t.type === 'employer_intake');

    setText('stat-total-apps',   mlTasks.length);
    setText('stat-new-apps',     applications.length);
    setText('stat-employer-req', empRequests.length);

    renderList('applications-list', applications.slice(0, 10), renderAppItem);
    renderList('employer-requests-list', empRequests.slice(0, 6), renderReqItem);
  } catch {
    showToast('Could not load dashboard data.', 'error');
  }

  try {
    const rewards = await fetchJSON(`${API_BASE}/rewards/user/${userId}`);
    setText('stat-rewards', rewards.length || 0);
  } catch {
    setText('stat-rewards', 0);
  }
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function renderList(id, items, renderFn) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = items.length
    ? items.map(renderFn).join('')
    : '<p class="empty-state">Nothing here yet.</p>';
}

function renderAppItem(a) {
  return `
    <div class="list-item">
      <div class="list-item-info">
        <strong>${a.title || 'Application'}</strong>
        <span>${a.applicantName ? 'From: ' + a.applicantName : a.description || ''}</span>
      </div>
      <span class="badge badge-new">New</span>
    </div>`;
}

function renderReqItem(r) {
  return `
    <div class="list-item">
      <div class="list-item-info">
        <strong>${r.title || 'Request'}</strong>
        <span>${r.companyName ? r.companyName : r.description || ''}</span>
      </div>
      <span class="badge badge-pending">Pending</span>
    </div>`;
}

/* ── Quick task creation ── */
document.getElementById('task-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('task-title');
  const title = input?.value.trim();
  if (!title) return;
  try {
    await fetchJSON(`${API_BASE}/tasks`, {
      method: 'POST',
      body: JSON.stringify({
        title,
        app: 'marchLewis',
        type: 'recruiter_task',
        assignedTo: userId,
      }),
    });
    showToast('Task added!', 'success');
    if (input) input.value = '';
    loadDashboard();
  } catch {
    showToast('Could not add task.', 'error');
  }
});

loadDashboard();
