/* March & Lewis — Footer Component */

export function renderFooter() {
  return `
    <footer class="footer">
      <div class="container footer-inner">
        <p>&copy; ${new Date().getFullYear()} March &amp; Lewis &mdash; Part of the <a href="/">QSE Ecosystem</a></p>
        <nav class="footer-nav">
          <a href="/march-lewis/">Home</a>
          <a href="/march-lewis/jobs.html">Jobs</a>
          <a href="/march-lewis/employer-intake.html">Employers</a>
          <a href="/march-lewis/candidate-onboarding.html">Candidates</a>
          <a href="/march-lewis/login.html">Login</a>
        </nav>
      </div>
    </footer>
  `;
}

export function initFooter() {
  const placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;
  placeholder.outerHTML = renderFooter();
}
