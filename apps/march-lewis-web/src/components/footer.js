/* March & Lewis — Footer Component */

export function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} March &amp; Lewis &mdash; Part of the <a href="/">QSE Ecosystem</a></p>
    </div>
  `;
  document.body.appendChild(footer);
}
