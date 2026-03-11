/* March & Lewis — Employer Intake Form */
import { api } from '../api/client.js';

/**
 * Renders the employer intake form into the given container element.
 * On submit it POSTs to POST /api/tasks.
 *
 * @param {HTMLElement} container
 */
export function renderEmployerIntakeForm(container) {
  container.innerHTML = `
    <form class="form" id="employer-form" novalidate>
      <h2 style="text-align:center;margin-bottom:8px">Request Talent</h2>
      <p style="text-align:center;color:var(--text-muted);margin-bottom:20px">
        Tell us about your hiring needs and we will match you with pre-screened candidates.
      </p>

      <label class="form-label">Company Name <span class="required">*</span></label>
      <input type="text" id="ef-company" placeholder="Acme Corp" required />

      <label class="form-label">Contact Name <span class="required">*</span></label>
      <input type="text" id="ef-contact" placeholder="John Doe" required />

      <label class="form-label">Business Email <span class="required">*</span></label>
      <input type="email" id="ef-email" placeholder="john@acme.com" required />

      <label class="form-label">Phone Number</label>
      <input type="tel" id="ef-phone" placeholder="+1 (555) 000-0000" />

      <label class="form-label">Industry <span class="required">*</span></label>
      <select id="ef-industry" required>
        <option value="">— Select industry —</option>
        <option>Healthcare</option>
        <option>Technology / IT</option>
        <option>Administration / Office</option>
        <option>Finance &amp; Accounting</option>
        <option>Retail &amp; Customer Service</option>
        <option>Manufacturing &amp; Logistics</option>
        <option>Education</option>
        <option>Other</option>
      </select>

      <label class="form-label">Number of Positions Needed</label>
      <input type="number" id="ef-positions" placeholder="e.g. 3" min="1" />

      <label class="form-label">Employment Type</label>
      <select id="ef-type">
        <option value="">— Select type —</option>
        <option>Full-time</option>
        <option>Part-time</option>
        <option>Contract</option>
        <option>Temporary</option>
        <option>Temp-to-Hire</option>
      </select>

      <label class="form-label">Additional Notes</label>
      <textarea id="ef-notes" placeholder="Describe the roles, required skills, timeline, etc." rows="5"></textarea>

      <button type="submit" class="btn btn-primary" style="width:100%">Submit Request</button>
      <p id="ef-status" class="form-status" aria-live="polite"></p>
    </form>
  `;

  document.getElementById('employer-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('ef-status');
    const company = document.getElementById('ef-company').value.trim();
    const contact = document.getElementById('ef-contact').value.trim();
    const email = document.getElementById('ef-email').value.trim();
    const industry = document.getElementById('ef-industry').value;

    if (!company || !contact || !email || !industry) {
      status.style.color = '#f87171';
      status.textContent = 'Please fill in all required fields.';
      return;
    }

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Submitting…';
    status.style.color = '';
    status.textContent = '';

    try {
      await api.createTask({
        title: `Employer Request: ${company}`,
        description: `Contact: ${contact} (${email}). Industry: ${industry}. Positions: ${document.getElementById('ef-positions').value || 'N/A'}. Type: ${document.getElementById('ef-type').value || 'N/A'}. Notes: ${document.getElementById('ef-notes').value.trim()}`,
        app: 'marchLewis',
        type: 'employerRequest',
        status: 'pending',
      });
      status.style.color = '#4ade80';
      status.textContent = 'Your request has been received! A staffing specialist will contact you within 1 business day.';
      e.target.reset();
    } catch (err) {
      status.style.color = '#f87171';
      status.textContent = 'Could not submit your request. Please try again.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Submit Request';
    }
  });
}
