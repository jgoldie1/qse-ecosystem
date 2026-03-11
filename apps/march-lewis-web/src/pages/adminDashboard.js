/* March & Lewis — Admin Dashboard Page Module */
import { api } from '../api/client.js';
import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';

function requireAdmin() {
  try {
    const user = JSON.parse(localStorage.getItem('ml_user') || 'null');
    if (!user || user.role !== 'admin') {
      window.location.replace('/march-lewis/login.html');
      return null;
    }
    return user;
  } catch {
    window.location.replace('/march-lewis/login.html');
    return null;
  }
}

function statusBadge(status) {
  const colors = { pending: '#f59e0b', done: '#4ade80', 'in-progress': '#3b82f6', new: '#a78bfa' };
  const color = colors[status] || '#888';
  return `<span class="status-badge" style="background:${color}22;color:${color}">${status}</span>`;
}

async function loadAdminDashboard(user) {
  const container = document.getElementById('admin-content');

  try {
    const [tasks, courses, tiersRaw] = await Promise.all([
      api.getTasks(),
      api.getCourses(),
      api.getMembershipTiers(),
    ]);
    // Tiers come back as an object keyed by tier ID — normalise to array
    const tiers = Array.isArray(tiersRaw)
      ? tiersRaw
      : Object.entries(tiersRaw).map(([id, v]) => ({ id, ...v }));

    const applications = tasks.filter((t) => t.app === 'marchLewis' && t.type === 'jobApplication');
    const employerReqs = tasks.filter((t) => t.app === 'marchLewis' && t.type === 'employerRequest');
    const onboardings = tasks.filter((t) => t.app === 'marchLewis' && t.type === 'candidateOnboarding');
    const allML = tasks.filter((t) => t.app === 'marchLewis');

    container.innerHTML = `
      <!-- KPI row -->
      <div class="stats" style="margin:0 0 40px;justify-content:flex-start">
        <div class="stat-card"><span class="stat-number">${allML.length}</span><span class="stat-label">Total Tasks</span></div>
        <div class="stat-card"><span class="stat-number">${applications.length}</span><span class="stat-label">Applications</span></div>
        <div class="stat-card"><span class="stat-number">${employerReqs.length}</span><span class="stat-label">Employer Reqs</span></div>
        <div class="stat-card"><span class="stat-number">${onboardings.length}</span><span class="stat-label">Onboardings</span></div>
        <div class="stat-card"><span class="stat-number">${courses.length}</span><span class="stat-label">Courses</span></div>
        <div class="stat-card"><span class="stat-number">${tiers.length}</span><span class="stat-label">Membership Tiers</span></div>
      </div>

      <!-- Tabs -->
      <div class="tabs" id="admin-tabs">
        <button class="tab-btn active" data-tab="tasks">All Tasks</button>
        <button class="tab-btn" data-tab="courses">Courses</button>
        <button class="tab-btn" data-tab="memberships">Memberships</button>
      </div>

      <!-- Tasks tab -->
      <div id="tab-tasks" class="tab-panel">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px">
          <h3>All March &amp; Lewis Tasks</h3>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <input type="search" id="tasks-search" placeholder="🔍 Search…" class="search-input" style="max-width:200px" />
            <select id="tasks-type-filter" class="filter-select">
              <option value="">All Types</option>
              <option value="jobApplication">Applications</option>
              <option value="employerRequest">Employer Reqs</option>
              <option value="candidateOnboarding">Onboardings</option>
            </select>
            <select id="tasks-status-filter" class="filter-select">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
              <option value="new">New</option>
            </select>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table" id="tasks-table">
            <thead>
              <tr><th>Title</th><th>Type</th><th>Created</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              ${allML.length ? allML.map((t) => `
                <tr data-id="${t.id}" data-type="${t.type || ''}" data-status="${t.status || 'pending'}">
                  <td>
                    <strong>${t.title}</strong><br />
                    <span style="font-size:0.8rem;color:var(--text-muted)">${(t.description || '').substring(0, 80)}…</span>
                  </td>
                  <td><span style="font-size:0.82rem;text-transform:capitalize;color:var(--text-muted)">${(t.type || 'task').replace(/([A-Z])/g, ' $1')}</span></td>
                  <td style="font-size:0.82rem;color:var(--text-muted)">${t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}</td>
                  <td>${statusBadge(t.status || 'pending')}</td>
                  <td>
                    <select class="status-select" data-id="${t.id}" style="background:var(--surface-2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:4px 8px;font-size:0.82rem">
                      <option value="pending" ${(t.status || 'pending') === 'pending' ? 'selected' : ''}>Pending</option>
                      <option value="in-progress" ${t.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                      <option value="done" ${t.status === 'done' ? 'selected' : ''}>Done</option>
                      <option value="new" ${t.status === 'new' ? 'selected' : ''}>New</option>
                    </select>
                    <button class="btn-icon delete-task" data-id="${t.id}" title="Delete" style="margin-left:6px">🗑</button>
                  </td>
                </tr>
              `).join('') : '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">No tasks found</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Courses tab -->
      <div id="tab-courses" class="tab-panel hidden">
        <h3 style="margin-bottom:16px">Training Courses</h3>
        <div class="grid">
          ${courses.map((c) => `
            <div class="card">
              <div class="card-icon">🎓</div>
              <h3>${c.title}</h3>
              <p>Duration: ${c.duration}<br />App: <strong>${c.app}</strong></p>
              <span style="font-size:0.8rem;color:var(--text-muted)">ID: ${c.id}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Memberships tab -->
      <div id="tab-memberships" class="tab-panel hidden">
        <h3 style="margin-bottom:16px">Membership Tiers</h3>
        <div class="grid">
          ${tiers.map((tier) => `
            <div class="card">
              <div class="card-icon">⭐</div>
              <h3>${tier.name || tier.id}</h3>
              <p>Price: <strong>${tier.price !== undefined ? '$' + tier.price + '/mo' : 'Free'}</strong></p>
              ${tier.features ? `<ul style="color:var(--text-muted);font-size:0.85rem;padding-left:18px">${tier.features.map((f) => `<li>${f}</li>`).join('')}</ul>` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <p id="admin-status" class="form-status" aria-live="polite" style="margin-top:16px"></p>
    `;

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach((p) => p.classList.add('hidden'));
        btn.classList.add('active');
        document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('hidden');
      });
    });

    // Tasks search + filters
    function applyTaskFilters() {
      const q = document.getElementById('tasks-search').value.toLowerCase();
      const typeF = document.getElementById('tasks-type-filter').value;
      const statusF = document.getElementById('tasks-status-filter').value;
      document.querySelectorAll('#tasks-table tbody tr').forEach((tr) => {
        const text = tr.textContent.toLowerCase();
        const show =
          (!q || text.includes(q)) &&
          (!typeF || tr.dataset.type === typeF) &&
          (!statusF || tr.dataset.status === statusF);
        tr.style.display = show ? '' : 'none';
      });
    }
    ['tasks-search', 'tasks-type-filter', 'tasks-status-filter'].forEach((id) =>
      document.getElementById(id).addEventListener('input', applyTaskFilters)
    );

    // Status update
    document.querySelectorAll('.status-select').forEach((sel) => {
      sel.addEventListener('change', async () => {
        const st = document.getElementById('admin-status');
        try {
          await api.updateTask(sel.dataset.id, { status: sel.value });
          const tr = sel.closest('tr');
          if (tr) { tr.dataset.status = sel.value; tr.querySelector('.status-badge').textContent = sel.value; }
          st.style.color = '#4ade80';
          st.textContent = 'Status updated.';
          setTimeout(() => { st.textContent = ''; }, 2000);
        } catch {
          st.style.color = '#f87171';
          st.textContent = 'Could not update status.';
        }
      });
    });

    // Delete
    document.querySelectorAll('.delete-task').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this task permanently?')) return;
        try {
          await api.deleteTask(btn.dataset.id);
          btn.closest('tr').remove();
        } catch {
          alert('Could not delete task.');
        }
      });
    });

  } catch (err) {
    container.innerHTML = `<p style="color:#f87171">Could not load admin data. Please refresh the page.</p>`;
  }
}

export function initAdminDashboardPage() {
  const user = requireAdmin();
  if (!user) return;

  renderHeader();

  document.getElementById('app').innerHTML = `
    <main>
      <section class="section container">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;flex-wrap:wrap;gap:16px">
          <div>
            <h1 style="font-size:1.8rem;margin-bottom:4px">Admin Dashboard</h1>
            <p style="color:var(--text-muted);margin:0">Signed in as <strong>${user.name}</strong> (${user.role})</p>
          </div>
          <div style="display:flex;gap:12px">
            <a href="/march-lewis/recruiter-dashboard.html" class="btn btn-outline">Recruiter View</a>
            <a href="/march-lewis/" class="btn btn-primary">View Site</a>
          </div>
        </div>
        <div id="admin-content">
          <p class="loading">Loading admin data…</p>
        </div>
      </section>
    </main>
  `;

  renderFooter();
  loadAdminDashboard(user);
}
