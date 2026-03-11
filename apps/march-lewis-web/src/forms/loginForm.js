/* March & Lewis — Login form handler */

import { setSession } from '../api/client.js';
import { showToast } from '../components/toast.js';

export function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const role     = document.getElementById('login-role').value;

    if (!email || !password) {
      showToast('Please enter your email and password.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setSession({
      userId: role + '-' + Math.random().toString(36).slice(2, 8),
      email,
      role,
      name: email.split('@')[0],
    });

    showToast('Welcome back! Redirecting\u2026', 'success');

    setTimeout(() => {
      switch (role) {
        case 'admin':     window.location.href = '/march-lewis/admin-dashboard.html';    break;
        case 'recruiter': window.location.href = '/march-lewis/recruiter-dashboard.html'; break;
        case 'employer':  window.location.href = '/march-lewis/employer-intake.html';   break;
        default:          window.location.href = '/march-lewis/jobs.html';
      }
    }, 1200);
  });
}
