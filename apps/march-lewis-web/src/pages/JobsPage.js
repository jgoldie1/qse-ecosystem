const Header = require('../../../shared/components/Header');

function JobsPage(content = '') {
  return `
    <div class="page-shell">
      ${Header({
        title: 'Jobs',
        subtitle: 'Browse current staffing opportunities'
      })}
      <section class="panel">
        <h2>Open Roles</h2>
        ${content}
      </section>
    </div>
  `;
}

module.exports = JobsPage;
