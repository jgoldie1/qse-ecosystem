const { escapeHtml } = require('../utils/escape');

function FormInput({ name = '', type = 'text', placeholder = '', value = '' } = {}) {
  return `<input name="${escapeHtml(name)}" type="${escapeHtml(type)}" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(value)}" />`;
}

module.exports = FormInput;
