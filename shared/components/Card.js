const { escapeHtml } = require('../utils/escape');

function Card({ title = '', text = '', meta = '' } = {}) {
  return `
    <div class="card">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(text)}</p>
      ${meta ? `<span>${escapeHtml(meta)}</span>` : ''}
    </div>
  `;
}

module.exports = Card;
