/* March & Lewis — Job application form handler */

import { fetchJSON, API_BASE } from '../api/client.js';
import { showToast } from '../components/toast.js';

export function initApplicationForm(formId = 'apply-form') {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const origLabel = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Submitting\u2026';

    const name    = document.getElementById('apply-name')?.value.trim()    || '';
    const email   = document.getElementById('apply-email')?.value.trim()   || '';
    const role    = document.getElementById('apply-role')?.value.trim()    || '';
    const message = document.getElementById('apply-message')?.value.trim() || '';

    try {
      await fetchJSON(`${API_BASE}/tasks`, {
        method: 'POST',
        body: JSON.stringify({
          title: `Job Application: ${role || 'Open Position'}`,
          description: `Submitted by ${name} <${email}>. ${message}`,
          app: 'marchLewis',
          type: 'application',
          applicantName: name,
          applicantEmail: email,
        }),
      });
      showToast("Application submitted! We'll be in touch within 2 business days.", 'success');
      form.reset();
    } catch {
      showToast('Could not submit application. Please try again.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = origLabel;
    }
  });
}
