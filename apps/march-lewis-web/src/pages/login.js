/* March & Lewis — Login Page Module */
import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { renderLoginForm } from '../forms/loginForm.js';

export function initLoginPage() {
  // Redirect if already logged in
  try {
    const user = JSON.parse(localStorage.getItem('ml_user') || 'null');
    if (user) {
      const dest =
        user.role === 'admin'
          ? '/march-lewis/admin-dashboard.html'
          : user.role === 'recruiter'
          ? '/march-lewis/recruiter-dashboard.html'
          : '/march-lewis/candidate-onboarding.html';
      window.location.replace(dest);
      return;
    }
  } catch {}

  renderHeader();

  document.getElementById('app').innerHTML = `
    <main>
      <section class="section container" style="min-height:70vh;display:flex;align-items:center;justify-content:center">
        <div id="login-form-container" style="width:100%;max-width:440px"></div>
      </section>
    </main>
  `;

  renderFooter();
  renderLoginForm(document.getElementById('login-form-container'));
}
