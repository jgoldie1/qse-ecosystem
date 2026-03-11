/* March & Lewis — Footer component */

export function mountFooter() {
  const el = document.getElementById('app-footer');
  if (!el) return;

  el.innerHTML = `
    <footer class="footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <span class="logo">March &amp; Lewis</span>
          <p>Connecting top talent with great employers across the nation.</p>
        </div>
        <nav class="footer-nav">
          <div class="footer-col">
            <h4>Job Seekers</h4>
            <a href="/march-lewis/jobs.html">Browse Jobs</a>
            <a href="/march-lewis/candidate-onboarding.html">Create Profile</a>
            <a href="/march-lewis/#training">Training Programs</a>
          </div>
          <div class="footer-col">
            <h4>Employers</h4>
            <a href="/march-lewis/employer-intake.html">Post a Job</a>
            <a href="/march-lewis/employer-intake.html">Talent Search</a>
            <a href="/march-lewis/recruiter-dashboard.html">Recruiter Login</a>
          </div>
          <div class="footer-col">
            <h4>Platform</h4>
            <a href="/march-lewis/#contact">About Us</a>
            <a href="/march-lewis/login.html">Sign In</a>
            <a href="/">QSE Ecosystem</a>
          </div>
        </nav>
      </div>
      <div class="container">
        <hr class="footer-hr" />
        <p class="footer-copy">&copy; 2025 March &amp; Lewis &mdash; Part of the <a href="/">QSE Ecosystem</a></p>
      </div>
    </footer>
  `;
}
