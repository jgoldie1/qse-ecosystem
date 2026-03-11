/* Sculptify – Footer component (ES module) */

/**
 * Build the footer HTML string.
 * @returns {string}
 */
export function renderFooter() {
  const year = new Date().getFullYear();
  return `
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <a href="/sculptify/src/pages/home.html" class="logo">Sculptify</a>
          <p>Premium beauty, wellness &amp; training. Part of the QSE Ecosystem.</p>
        </div>
        <div>
          <h4>Services</h4>
          <ul>
            <li><a href="/sculptify/src/pages/providers.html">Find Providers</a></li>
            <li><a href="/sculptify/src/pages/booking.html">Book Appointment</a></li>
            <li><a href="/sculptify/src/pages/home.html#training">Training Programs</a></li>
          </ul>
        </div>
        <div>
          <h4>Platform</h4>
          <ul>
            <li><a href="/sculptify/src/pages/therapist-onboarding.html">Join as Therapist</a></li>
            <li><a href="/sculptify/src/pages/login.html">Login</a></li>
            <li><a href="/">QSE Ecosystem</a></li>
          </ul>
        </div>
      </div>
      <p class="footer-copy">&copy; ${year} Sculptify &mdash; Part of the <a href="/">QSE Ecosystem</a></p>
    </div>
  </footer>`;
}

/**
 * Append the footer at the end of <body>.
 */
export function initFooter() {
  document.body.insertAdjacentHTML('beforeend', renderFooter());
}
