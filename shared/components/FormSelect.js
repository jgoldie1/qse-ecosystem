const { escapeHtml } = require('../utils/escape');

function FormSelect({ name = '', options = [] } = {}) {
  return `
    <select name="${escapeHtml(name)}">
      ${options.map(option => `<option value="${escapeHtml(option.value ?? option)}">${escapeHtml(option.label ?? option)}</option>`).join('')}
    </select>
  `;
}

module.exports = FormSelect;
