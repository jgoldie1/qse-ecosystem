/* Sculptify – Admin Page Module */

import { initAdminLoginForm } from '../forms/admin-login.js';
import { renderDashboard } from './dashboard.js';

/**
 * Initialise the admin section:
 *  - wire the login form
 *  - listen for the 'admin:loggedin' event and render the dashboard
 */
export function initAdminPage() {
  initAdminLoginForm();

  document.addEventListener('admin:loggedin', (e) => {
    const loginSection = document.getElementById('admin-login-section');
    if (loginSection) loginSection.hidden = true;
    renderDashboard(e.detail);
  });
}
