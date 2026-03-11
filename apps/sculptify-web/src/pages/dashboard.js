/* Sculptify – Dashboard Page Module */

/**
 * Render the admin dashboard with stats, recent bookings and
 * pending onboarding applications inside #dashboard-section.
 *
 * @param {Object} data  Response from GET /api/admin/dashboard
 */
export function renderDashboard(data) {
  const section = document.getElementById('dashboard-section');
  if (!section) return;

  const { stats = {}, recentBookings = [], onboarding = [], totalBookings = 0 } = data;

  const bookingRows = recentBookings.length
    ? recentBookings.map(b => `
        <tr>
          <td>${b.title}</td>
          <td>${b.description}</td>
          <td class="status-badge status-${b.status}">${b.status}</td>
          <td>${new Date(b.createdAt).toLocaleDateString()}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="4" class="loading">No bookings yet.</td></tr>';

  const onboardingRows = onboarding.length
    ? onboarding.map(o => `
        <tr>
          <td>${o.name}</td>
          <td>${o.email}</td>
          <td>${o.specialty || '—'}</td>
          <td class="status-badge status-${o.status}">${o.status}</td>
          <td>${new Date(o.submittedAt).toLocaleDateString()}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="5" class="loading">No applications yet.</td></tr>';

  section.innerHTML = `
    <div class="dashboard-header">
      <h2>Admin Dashboard</h2>
      <button class="btn btn-outline" id="dashboard-logout">Log Out</button>
    </div>

    <div class="dashboard-stats">
      <div class="dash-stat">
        <span class="stat-number">${totalBookings}</span>
        <span class="stat-label">Total Bookings</span>
      </div>
      <div class="dash-stat">
        <span class="stat-number">${stats.appointments ?? 0}</span>
        <span class="stat-label">Appointments</span>
      </div>
      <div class="dash-stat">
        <span class="stat-number">${stats.sales ?? 0}</span>
        <span class="stat-label">Products Sold</span>
      </div>
      <div class="dash-stat">
        <span class="stat-number">${stats.trainingEnrollments ?? 0}</span>
        <span class="stat-label">Students Enrolled</span>
      </div>
      <div class="dash-stat">
        <span class="stat-number">${onboarding.length}</span>
        <span class="stat-label">Onboarding Applications</span>
      </div>
    </div>

    <h3 class="dashboard-table-heading">Recent Bookings</h3>
    <div class="table-wrap">
      <table class="dashboard-table">
        <thead>
          <tr><th>Title</th><th>Description</th><th>Status</th><th>Date</th></tr>
        </thead>
        <tbody>${bookingRows}</tbody>
      </table>
    </div>

    <h3 class="dashboard-table-heading">Provider Applications</h3>
    <div class="table-wrap">
      <table class="dashboard-table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Specialty</th><th>Status</th><th>Date</th></tr>
        </thead>
        <tbody>${onboardingRows}</tbody>
      </table>
    </div>
  `;

  document.getElementById('dashboard-logout').addEventListener('click', () => {
    section.innerHTML = '';
    const loginSection = document.getElementById('admin-login-section');
    if (loginSection) loginSection.hidden = false;
  });
}
