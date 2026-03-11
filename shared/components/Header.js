const { escapeHtml, safeHref } = require('../utils/escape');

function Header({ title = '', subtitle = '', actions = [] } = {}) {
  return `
    <header class="app-header panel">
      <div>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(subtitle)}</p>
      </div>
      <div class="row">
        ${actions.map(action => `<a class="btn secondary" href="${safeHref(action.href)}">${escapeHtml(action.label || 'Action')}</a>`).join('')}
      </div>
    </header>
  `;
}

module.exports = Header;
