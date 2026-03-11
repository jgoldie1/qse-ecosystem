const Header = require('../../../shared/components/Header');

function RecruiterDashboardPage(statsHtml = '') {
  return `
    <div class="page-shell">
      ${Header({
        title: 'Recruiter Dashboard',
        subtitle: 'Jobs, employers, candidates, and interview scheduling'
      })}
      <section class="panel">
        <h2>Metrics</h2>
        ${statsHtml}
      </section>
    </div>
  `;
}

module.exports = RecruiterDashboardPage;
