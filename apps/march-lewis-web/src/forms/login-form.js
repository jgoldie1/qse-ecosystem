/* March & Lewis — Login Form */

const SESSION_KEY = 'ml_session';

export const ROLES = {
  CANDIDATE: 'candidate',
  RECRUITER: 'recruiter',
  ADMIN: 'admin'
};

// Simulated user accounts (no server-side auth endpoint exists)
const DEMO_USERS = [
  { email: 'recruiter@marchlewis.com', password: 'recruiter123', role: ROLES.RECRUITER, name: 'Alex Recruiter' },
  { email: 'admin@marchlewis.com', password: 'admin123', role: ROLES.ADMIN, name: 'Sam Admin' },
  { email: 'demo@example.com', password: 'demo123', role: ROLES.CANDIDATE, name: 'Jordan Candidate' }
];

export function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function saveSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function requireSession(redirectTo = '/march-lewis/login.html') {
  const session = getSession();
  if (!session) {
    window.location.href = redirectTo;
    return null;
  }
  return session;
}

export function renderLoginForm(formId = 'login-form') {
  return `
    <form class="form" id="${formId}" novalidate>
      <div class="form-group">
        <label for="login-email">Email Address <span class="required">*</span></label>
        <input type="email" id="login-email" name="email" placeholder="you@example.com" required autocomplete="email" />
      </div>
      <div class="form-group">
        <label for="login-password">Password <span class="required">*</span></label>
        <input type="password" id="login-password" name="password" placeholder="••••••••" required autocomplete="current-password" />
      </div>
      <button type="submit" class="btn btn-primary btn-full">Sign In</button>
      <p id="login-status" class="form-status" aria-live="polite"></p>
      <p class="form-hint">
        Demo accounts: <code>recruiter@marchlewis.com / recruiter123</code>,
        <code>admin@marchlewis.com / admin123</code>,
        <code>demo@example.com / demo123</code>
      </p>
    </form>
  `;
}

export function initLoginForm(formId = 'login-form') {
  const form = document.getElementById(formId);
  if (!form) return;

  // Already logged in? Redirect.
  const existing = getSession();
  if (existing) {
    redirectByRole(existing.role);
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('login-status');
    const submitBtn = form.querySelector('[type="submit"]');

    const email = form.querySelector('[name="email"]').value.trim().toLowerCase();
    const password = form.querySelector('[name="password"]').value;

    if (!email || !password) {
      setStatus(status, 'Please enter your email and password.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in…';
    setStatus(status, '', '');

    // Simulate async auth delay
    await new Promise(r => setTimeout(r, 400));

    const user = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (!user) {
      setStatus(status, 'Invalid email or password. Please try again.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
      return;
    }

    saveSession({ email: user.email, name: user.name, role: user.role });
    setStatus(status, `✓ Welcome back, ${user.name}! Redirecting…`, 'success');

    setTimeout(() => redirectByRole(user.role), 800);
  });
}

function redirectByRole(role) {
  switch (role) {
    case ROLES.ADMIN:
      window.location.href = '/march-lewis/admin-dashboard.html';
      break;
    case ROLES.RECRUITER:
      window.location.href = '/march-lewis/recruiter-dashboard.html';
      break;
    default:
      window.location.href = '/march-lewis/';
  }
}

function setStatus(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className = `form-status${type ? ' form-status--' + type : ''}`;
}
