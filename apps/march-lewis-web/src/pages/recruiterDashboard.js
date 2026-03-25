/* March & Lewis — Recruiter Dashboard Page Module */
import { api } from '../api/client.js';
import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';

function requireAuth(allowedRoles) {
  try {
    const user = JSON.parse(localStorage.getItem('ml_user') || 'null');
    if (!user || !allowedRoles.includes(user.role)) {
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
  return `<span style="background:${color}22;color:${color};border-radius:4px;padding:2px 8px;font-size:0.78rem;font-weight:600;text-transform:capitalize">${status}</span>`;
}

async function loadDashboard(user) {
  const container = document.getElementById('dashboard-content');

  try {
    const [tasks, courses] = await Promise.all([api.getTasks(), api.getCourses()]);

    const applications = tasks.filter((t) => t.app === 'marchLewis' && t.type === 'jobApplication');
    const employerReqs = tasks.filter((t) => t.app === 'marchLewis' && t.type === 'employerRequest');
    const onboardings = tasks.filter((t) => t.app === 'marchLewis' && t.type === 'candidateOnboarding');

    container.innerHTML = `
      <!-- Stats row -->
      <div class="stats" style="margin:0 0 40px;justify-content:flex-start">
        <div class="stat-card">
          <span class="stat-number">${applications.length}</span>
          <span class="stat-label">Applications</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">${employerReqs.length}</span>
          <span class="stat-label">Employer Requests</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">${onboardings.length}</span>
          <span class="stat-label">Onboardings</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">${courses.length}</span>
          <span class="stat-label">Active Courses</span>
        </div>
      </div>

      <!-- Applications table -->
      <div class="dashboard-section">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h3>Job Applications</h3>
          <input type="search" id="app-search" placeholder="🔍 Filter…" class="search-input" style="max-width:220px" />
        </div>
        <div class="table-wrap">
          <table class="data-table" id="applications-table">
            <thead>
              <tr>
                <th>Applicant / Role</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${applications.length ? applications.map((t) => `
                <tr data-id="${t.id}">
                  <td>
                    <strong>${t.title.replace('Job Application: ', '')}</strong><br />
                    <span style="font-size:0.82rem;color:var(--text-muted)">${(t.description || '').split('.')[0]}</span>
                  </td>
                  <td style="font-size:0.85rem;color:var(--text-muted)">${t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>${statusBadge(t.status || 'pending')}</td>
                  <td>
                    <select class="status-select" data-id="${t.id}" style="background:var(--surface-2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:4px 8px;font-size:0.82rem">
                      <option value="pending" ${(t.status || 'pending') === 'pending' ? 'selected' : ''}>Pending</option>
                      <option value="in-progress" ${t.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                      <option value="done" ${t.status === 'done' ? 'selected' : ''}>Done</option>
                    </select>
                    <button class="btn-icon delete-task" data-id="${t.id}" title="Delete" style="margin-left:6px">🗑</button>
                  </td>
                </tr>
              `).join('') : '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">No applications yet</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Employer Requests -->
      <div class="dashboard-section" style="margin-top:40px">
        <h3 style="margin-bottom:16px">Employer Requests</h3>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr><th>Company / Contact</th><th>Submitted</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              ${employerReqs.length ? employerReqs.map((t) => `
                <tr data-id="${t.id}">
                  <td>
                    <strong>${t.title.replace('Employer Request: ', '')}</strong><br />
                    <span style="font-size:0.82rem;color:var(--text-muted)">${(t.description || '').split('.')[0]}</span>
                  </td>
                  <td style="font-size:0.85rem;color:var(--text-muted)">${t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>${statusBadge(t.status || 'pending')}</td>
                  <td>
                    <select class="status-select" data-id="${t.id}" style="background:var(--surface-2);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:4px 8px;font-size:0.82rem">
                      <option value="pending" ${(t.status || 'pending') === 'pending' ? 'selected' : ''}>Pending</option>
                      <option value="in-progress" ${t.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                      <option value="done" ${t.status === 'done' ? 'selected' : ''}>Done</option>
                    </select>
                    <button class="btn-icon delete-task" data-id="${t.id}" title="Delete" style="margin-left:6px">🗑</button>
                  </td>
                </tr>
              `).join('') : '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">No employer requests yet</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <p id="dash-status" class="form-status" aria-live="polite" style="margin-top:16px"></p>
    `;

    // Status update handlers
    document.querySelectorAll('.status-select').forEach((sel) => {
      sel.addEventListener('change', async () => {
        const st = document.getElementById('dash-status');
        try {
          await api.updateTask(sel.dataset.id, { status: sel.value });
          st.style.color = '#4ade80';
          st.textContent = 'Status updated.';
          setTimeout(() => { st.textContent = ''; }, 2000);
        } catch {
          st.style.color = '#f87171';
          st.textContent = 'Could not update status.';
        }
      });
    });

    // Delete handlers
    document.querySelectorAll('.delete-task').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this record?')) return;
        try {
          await api.deleteTask(btn.dataset.id);
          btn.closest('tr').remove();
        } catch {
          alert('Could not delete record.');
        }
      });
    });

    // Application search filter
    document.getElementById('app-search').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('#applications-table tbody tr').forEach((tr) => {
        tr.style.display = !q || tr.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });

  } catch (err) {
    container.innerHTML = `<p style="color:#f87171">Could not load dashboard data. Please refresh.</p>`;
  }
}

export function initRecruiterDashboardPage() {
  const user = requireAuth(['recruiter', 'admin']);
  if (!user) return;

  renderHeader();

  document.getElementById('app').innerHTML = `
    <main>
      <section class="section container">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;flex-wrap:wrap;gap:16px">
          <div>
            <h1 style="font-size:1.8rem;margin-bottom:4px">Recruiter Dashboard</h1>
            <p style="color:var(--text-muted);margin:0">Welcome back, ${user.name}!</p>
          </div>
          <div style="display:flex;gap:12px">
            <a href="/march-lewis/jobs.html" class="btn btn-outline">Browse Jobs</a>
            <a href="/march-lewis/candidate-onboarding.html" class="btn btn-primary">Add Candidate</a>
          </div>
        </div>
        <div id="dashboard-content">
          <p class="loading">Loading dashboard…</p>
        </div>
      </section>
    </main>
  `;

  renderFooter();
  loadDashboard(user);
}
