const { escapeHtml } = require('../utils/escape');

function Button({ label = 'Submit', type = 'button', variant = 'primary', id = '' } = {}) {
  return `<button ${id ? `id="${escapeHtml(id)}"` : ''} type="${escapeHtml(type)}" class="btn ${escapeHtml(variant)}">${escapeHtml(label)}</button>`;
}

module.exports = Button;
