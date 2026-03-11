/* Sculptify – Login form handler (ES module) */

import { showToast } from '/sculptify/src/components/toast.js';

/**
 * Demo credentials for the prototype.
 * In a production system these would be validated server-side.
 */
const DEMO_USERS = [
  { email: 'admin@sculptify.com',  password: 'admin123', role: 'admin', name: 'Admin User' },
  { email: 'user@sculptify.com',   password: 'user123',  role: 'user',  name: 'Demo User' }
];

/**
 * Attach submit handler to a login form.
 * Stores session in localStorage on success and redirects.
 * @param {HTMLFormElement} formEl
 */
export function initLoginForm(formEl) {
  formEl.addEventListener('submit', (e) => {
    e.preventDefault();

    const email    = formEl.querySelector('[name="email"]').value.trim().toLowerCase();
    const password = formEl.querySelector('[name="password"]').value;

    const match = DEMO_USERS.find(u => u.email === email && u.password === password);

    if (match) {
      localStorage.setItem('sculptify_user', JSON.stringify({ name: match.name, email: match.email }));
      localStorage.setItem('sculptify_role', match.role);
      showToast(`Welcome back, ${match.name}!`);
      setTimeout(() => {
        window.location.href = match.role === 'admin'
          ? '/sculptify/src/pages/admin.html'
          : '/sculptify/src/pages/home.html';
      }, 900);
    } else {
      showToast('Invalid email or password. Try the demo credentials below.', 'error');
    }
  });
}

/**
 * Redirect to login if a valid session (and optional role) is not present.
 * @param {string|null} requiredRole  – 'admin', 'user', or null (any authenticated user)
 * @returns {{ name: string, email: string }|null}  – Current user or null if redirected
 */
export function requireAuth(requiredRole = null) {
  const raw = localStorage.getItem('sculptify_user');
  const role = localStorage.getItem('sculptify_role');

  if (!raw) {
    window.location.href = '/sculptify/src/pages/login.html';
    return null;
  }

  if (requiredRole && role !== requiredRole) {
    window.location.href = '/sculptify/src/pages/login.html';
    return null;
  }

  return JSON.parse(raw);
}

/**
 * Clear session and redirect to login.
 */
export function logout() {
  localStorage.removeItem('sculptify_user');
  localStorage.removeItem('sculptify_role');
  window.location.href = '/sculptify/src/pages/login.html';
}
