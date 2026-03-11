const { escapeHtml } = require('../utils/escape');

function Footer({ brand = 'QSE Ecosystem', text = 'Powered by QSE Core' } = {}) {
  return `
    <footer class="panel">
      <p><strong>${escapeHtml(brand)}</strong></p>
      <p>${escapeHtml(text)}</p>
    </footer>
  `;
}

module.exports = Footer;
