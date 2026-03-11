const { escapeHtml, safeHref } = require('../utils/escape');

function Hero({ pill = '', title = '', description = '', actions = [] } = {}) {
  return `
    <section class="hero">
      <span class="pill">${escapeHtml(pill)}</span>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(description)}</p>
      <div class="row">
        ${actions.map(action => `<a class="btn ${escapeHtml(action.variant || 'secondary')}" href="${safeHref(action.href)}">${escapeHtml(action.label || 'Open')}</a>`).join('')}
      </div>
    </section>
  `;
}

module.exports = Hero;
