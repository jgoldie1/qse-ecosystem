const { escapeHtml } = require('../utils/escape');

function DashboardPanel({ title = '', body = '' } = {}) {
  return `
    <section class="panel">
      <h2>${escapeHtml(title)}</h2>
      <div>${body}</div>
    </section>
  `;
}

module.exports = DashboardPanel;
