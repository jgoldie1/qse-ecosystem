/* March & Lewis — Employer intake form handler */

import { fetchJSON, API_BASE } from '../api/client.js';
import { showToast } from '../components/toast.js';

export function initEmployerForm() {
  const form = document.getElementById('employer-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const origLabel = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Submitting\u2026';

    const val = (id) => document.getElementById(id)?.value.trim() || '';

    try {
      await fetchJSON(`${API_BASE}/tasks`, {
        method: 'POST',
        body: JSON.stringify({
          title: `Employer Request: ${val('employer-position')} at ${val('employer-company')}`,
          description: `Contact: ${val('employer-contact')} <${val('employer-email')}>. ${val('employer-description')}`,
          app: 'marchLewis',
          type: 'employer_intake',
          companyName:   val('employer-company'),
          contactName:   val('employer-contact'),
          contactEmail:  val('employer-email'),
          phone:         val('employer-phone'),
          industry:      val('employer-industry'),
          positionTitle: val('employer-position'),
          positionType:  val('employer-type'),
          location:      val('employer-location'),
          requirements:  val('employer-requirements'),
          description:   val('employer-description'),
        }),
      });
      showToast('Request submitted! Our team will contact you within 1 business day.', 'success');
      form.reset();
    } catch {
      showToast('Could not submit request. Please try again.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = origLabel;
    }
  });
}
