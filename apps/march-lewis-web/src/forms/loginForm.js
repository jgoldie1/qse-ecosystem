/* March & Lewis — Login Form */

const DEMO_USERS = [
  { email: 'admin@marchlewis.com', password: 'admin123', role: 'admin', name: 'Admin User' },
  { email: 'recruiter@marchlewis.com', password: 'recruiter123', role: 'recruiter', name: 'Alex Recruiter' },
  { email: 'candidate@marchlewis.com', password: 'candidate123', role: 'candidate', name: 'Jordan Candidate' },
];

/**
 * Renders the login form into the given container element.
 * On success stores user data in localStorage and redirects.
 *
 * @param {HTMLElement} container
 */
export function renderLoginForm(container) {
  container.innerHTML = `
    <div class="login-card">
      <div class="login-logo">March &amp; Lewis</div>
      <h2 style="text-align:center;margin-bottom:6px">Sign In</h2>
      <p style="text-align:center;color:var(--text-muted);margin-bottom:24px;font-size:0.9rem">
        Access your dashboard and manage your account.
      </p>

      <form class="form" id="login-form" novalidate>
        <label class="form-label">Email Address <span class="required">*</span></label>
        <input type="email" id="lf-email" placeholder="you@example.com" required autocomplete="email" />

        <label class="form-label">Password <span class="required">*</span></label>
        <div style="position:relative">
          <input type="password" id="lf-password" placeholder="••••••••" required autocomplete="current-password" style="padding-right:48px" />
          <button type="button" id="lf-toggle-pw" class="pw-toggle" aria-label="Show/hide password">👁</button>
        </div>

        <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px">Sign In</button>
        <p id="lf-status" class="form-status" aria-live="polite"></p>
      </form>

      <div class="login-demo">
        <p style="color:var(--text-muted);font-size:0.8rem;text-align:center;margin-bottom:12px">Demo credentials:</p>
        <div class="demo-accounts">
          <button class="demo-btn" data-email="admin@marchlewis.com" data-pw="admin123">Admin</button>
          <button class="demo-btn" data-email="recruiter@marchlewis.com" data-pw="recruiter123">Recruiter</button>
          <button class="demo-btn" data-email="candidate@marchlewis.com" data-pw="candidate123">Candidate</button>
        </div>
      </div>
    </div>
  `;

  // Password visibility toggle
  document.getElementById('lf-toggle-pw').addEventListener('click', () => {
    const pw = document.getElementById('lf-password');
    pw.type = pw.type === 'password' ? 'text' : 'password';
  });

  // Demo account quick-fill
  container.querySelectorAll('.demo-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.getElementById('lf-email').value = btn.dataset.email;
      document.getElementById('lf-password').value = btn.dataset.pw;
    });
  });

  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const status = document.getElementById('lf-status');
    const email = document.getElementById('lf-email').value.trim().toLowerCase();
    const password = document.getElementById('lf-password').value;

    const user = DEMO_USERS.find((u) => u.email === email && u.password === password);
    if (!user) {
      status.style.color = '#f87171';
      status.textContent = 'Invalid email or password. Please try again.';
      return;
    }

    localStorage.setItem('ml_user', JSON.stringify({ id: `user-${user.role}`, email: user.email, name: user.name, role: user.role }));

    const redirect =
      user.role === 'admin'
        ? '/march-lewis/admin-dashboard.html'
        : user.role === 'recruiter'
        ? '/march-lewis/recruiter-dashboard.html'
        : '/march-lewis/candidate-onboarding.html';

    window.location.href = redirect;
  });
}
