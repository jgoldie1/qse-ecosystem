function escape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function Footer({ brand = '' } = {}) {
  return `
    <footer class="footer">
      <div class="container">
        <p>&copy; ${new Date().getFullYear()} ${escape(brand)} &mdash; Part of the <a href="/">QSE Ecosystem</a></p>
      </div>
    </footer>
  `;
}

module.exports = Footer;
