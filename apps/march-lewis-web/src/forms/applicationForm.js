/* March & Lewis — Application Form */
import { api } from '../api/client.js';

/**
 * Renders the job application form into the given container element.
 * On submit it POSTs to POST /api/tasks.
 *
 * @param {HTMLElement} container
 */
export function renderApplicationForm(container) {
  container.innerHTML = `
    <form class="form" id="application-form" novalidate>
      <h2 style="text-align:center;margin-bottom:8px">Apply for a Position</h2>
      <p style="text-align:center;color:var(--text-muted);margin-bottom:20px">
        Submit your details and our team will be in touch within 2 business days.
      </p>

      <label class="form-label">Full Name <span class="required">*</span></label>
      <input type="text" id="af-name" placeholder="Jane Smith" required />

      <label class="form-label">Email Address <span class="required">*</span></label>
      <input type="email" id="af-email" placeholder="jane@example.com" required />

      <label class="form-label">Phone Number</label>
      <input type="tel" id="af-phone" placeholder="+1 (555) 000-0000" />

      <label class="form-label">Position You Are Applying For <span class="required">*</span></label>
      <select id="af-role" required>
        <option value="">— Select a role —</option>
        <option>Administrative Assistant</option>
        <option>IT Support Specialist</option>
        <option>Healthcare Coordinator</option>
        <option>Workforce Recruiter</option>
        <option>Other / Open to Suggestions</option>
      </select>

      <label class="form-label">Cover Message</label>
      <textarea id="af-message" placeholder="Tell us about yourself and why you are a great fit…" rows="5"></textarea>

      <button type="submit" class="btn btn-primary" style="width:100%">Submit Application</button>
      <p id="af-status" class="form-status" aria-live="polite"></p>
    </form>
  `;

  document.getElementById('application-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('af-status');
    const name = document.getElementById('af-name').value.trim();
    const email = document.getElementById('af-email').value.trim();
    const role = document.getElementById('af-role').value;

    if (!name || !email || !role) {
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
        title: `Job Application: ${role}`,
        description: `Applicant: ${name} (${email}). Role: ${role}. Message: ${document.getElementById('af-message').value.trim()}`,
        app: 'marchLewis',
        type: 'jobApplication',
        status: 'pending',
      });
      status.style.color = '#4ade80';
      status.textContent = 'Your application has been received! We will be in touch shortly.';
      e.target.reset();
    } catch (err) {
      status.style.color = '#f87171';
      status.textContent = 'Could not submit your application. Please try again.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Submit Application';
    }
  });
}
