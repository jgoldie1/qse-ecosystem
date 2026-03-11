/* March & Lewis — Admin dashboard page */

import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { fetchJSON, API_BASE, getSession } from '../api/client.js';
import { showToast } from '../components/toast.js';

/* Auth guard */
const session = getSession();
if (!session || session.role !== 'admin') {
  window.location.href = '/march-lewis/login.html';
}

mountHeader('dashboard');
mountFooter();

const nameEl = document.getElementById('admin-name');
if (nameEl) nameEl.textContent = session?.name || 'Admin';

/* ── Load all data in parallel ── */
async function loadAll() {
  await Promise.allSettled([
    loadPlatformStats(),
    loadTasks(),
    loadTraining(),
    loadRewards(),
    loadMemberships(),
  ]);
}

async function loadPlatformStats() {
  try {
    const health = await fetchJSON(`${API_BASE}/health`);
    setText('platform-status', health.status === 'ok' ? '\u2705 Online' : '\u26A0\uFE0F Issues');
    const analytics = await fetchJSON('/data/analytics.json').catch(() => null);
    const ml = analytics?.marchLewis;
    if (ml) {
      setText('admin-stat-apps',      ml.jobApplications);
      setText('admin-stat-employers', ml.employerRequests);
      setText('admin-stat-training',  ml.trainingEnrollments);
    }
  } catch { /* ignore */ }
}

async function loadTasks() {
  try {
    const tasks   = await fetchJSON(`${API_BASE}/tasks`);
    const mlTasks = tasks.filter((t) => t.app === 'marchLewis');
    setText('admin-stat-tasks', mlTasks.length);

    const tbody = document.getElementById('tasks-table-body');
    if (tbody) {
      tbody.innerHTML = mlTasks.slice(0, 15).map((t) => `
        <tr>
          <td>${t.id || '\u2014'}</td>
          <td>${t.title || '\u2014'}</td>
          <td><span class="badge badge-${(t.type || 'task').replace(/_/g, '-')}">${t.type || 'task'}</span></td>
          <td>${t.status || 'open'}</td>
        </tr>`).join('');
    }
  } catch {
    showToast('Could not load tasks.', 'error');
  }
}

async function loadTraining() {
  try {
    const courses = await fetchJSON(`${API_BASE}/training/courses`);
    setText('admin-stat-courses', courses.length);

    const list = document.getElementById('courses-list');
    if (list) {
      list.innerHTML = courses.map((c) => `
        <div class="list-item">
          <div class="list-item-info">
            <strong>${c.title}</strong>
            <span>${c.duration} &middot; ${c.app}</span>
          </div>
          <span class="badge badge-active">Active</span>
        </div>`).join('');
    }
  } catch { /* ignore */ }
}

async function loadRewards() {
  try {
    const rewards = await fetchJSON(`${API_BASE}/rewards`);
    setText('admin-stat-rewards', rewards.length || 0);
  } catch {
    setText('admin-stat-rewards', 0);
  }
}

async function loadMemberships() {
  try {
    const tiers = await fetchJSON(`${API_BASE}/memberships/tiers`);
    setText('admin-stat-tiers', tiers.length || 0);
  } catch {
    setText('admin-stat-tiers', 0);
  }
}

/* ── Issue reward form ── */
document.getElementById('reward-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userId = document.getElementById('reward-user')?.value.trim();
  const type   = document.getElementById('reward-type')?.value;
  const amount = parseFloat(document.getElementById('reward-amount')?.value || '0');

  if (!userId || !amount) { showToast('Please fill in all fields.', 'error'); return; }

  try {
    await fetchJSON(`${API_BASE}/rewards/issue`, {
      method: 'POST',
      body: JSON.stringify({ userId, type, amount }),
    });
    showToast(`Reward issued to ${userId}!`, 'success');
    e.target.reset();
  } catch {
    showToast('Could not issue reward.', 'error');
  }
});

/* ── Helpers ── */
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

loadAll();
