function escape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function Header({ title = '', subtitle = '' } = {}) {
  return `
    <header class="header">
      <div class="container">
        <div class="logo">${escape(title)}</div>
        ${subtitle ? `<p class="subtitle">${escape(subtitle)}</p>` : ''}
      </div>
    </header>
  `;
}

module.exports = Header;
