const { escapeHtml } = require('../utils/escape');

function StatsGrid(items = []) {
  return `
    <div class="grid three">
      ${items.map(item => `
        <div class="card">
          <h3>${escapeHtml(item.label || '')}</h3>
          <p>${escapeHtml(item.value ?? '')}</p>
        </div>
      `).join('')}
    </div>
  `;
}

module.exports = StatsGrid;
