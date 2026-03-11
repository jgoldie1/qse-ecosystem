function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function safeHref(href) {
  const str = String(href ?? '#');
  return /^(https?:\/\/|\/|#)/.test(str) ? str : '#';
}

module.exports = { escapeHtml, safeHref };
