/* March & Lewis — Login page */

import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { initLoginForm } from '../forms/loginForm.js';
import { getSession } from '../api/client.js';

/* Redirect if already authenticated */
const existing = getSession();
if (existing) {
  if (existing.role === 'admin')          window.location.href = '/march-lewis/admin-dashboard.html';
  else if (existing.role === 'recruiter') window.location.href = '/march-lewis/recruiter-dashboard.html';
  else                                    window.location.href = '/march-lewis/jobs.html';
}

mountHeader('login');
mountFooter();
initLoginForm();
