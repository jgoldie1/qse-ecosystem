/* Sculptify – Admin Login Form Module */

const API_BASE = '/api';

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Bind submit handler to the admin login form (#admin-login-form).
 * On success, dispatches a custom 'admin:loggedin' event with the
 * dashboard payload so the admin page can render it.
 */
export function initAdminLoginForm() {
  const form = document.getElementById('admin-login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('admin-login-status');
    const password = document.getElementById('admin-password').value;

    if (status) {
      status.style.color = '';
      status.textContent = 'Authenticating…';
    }

    try {
      const auth = await fetchJSON(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (auth.success) {
        const dashboard = await fetchJSON(`${API_BASE}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        document.dispatchEvent(new CustomEvent('admin:loggedin', { detail: dashboard }));
        form.reset();
        if (status) status.textContent = '';
      }
    } catch {
      if (status) {
        status.style.color = '#f87171';
        status.textContent = 'Invalid password. Please try again.';
      }
    }
  });
}
