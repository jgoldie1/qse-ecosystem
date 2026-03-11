const Header = require('../../../shared/components/Header');

function AdminDashboardPage(statsHtml = '') {
  return `
    <div class="page-shell">
      ${Header({
        title: 'March & Lewis Admin Dashboard',
        subtitle: 'Protected metrics and recent staffing activity'
      })}
      <section class="panel">
        <h2>Metrics</h2>
        ${statsHtml}
      </section>
      <section class="panel">
        <h2>Latest Activity</h2>
        <div id="adminLatest" class="cards"></div>
      </section>
    </div>
  `;
}

module.exports = AdminDashboardPage;
