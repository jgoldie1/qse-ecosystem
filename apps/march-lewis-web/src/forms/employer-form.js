/* March & Lewis — Employer Intake Form */

import { createTask } from '../api.js';

export function renderEmployerForm(formId = 'employer-form') {
  return `
    <form class="form form--wide" id="${formId}" novalidate>
      <div class="form-row">
        <div class="form-group">
          <label for="emp-company">Company Name <span class="required">*</span></label>
          <input type="text" id="emp-company" name="company" placeholder="Acme Corp" required />
        </div>
        <div class="form-group">
          <label for="emp-contact">Contact Name <span class="required">*</span></label>
          <input type="text" id="emp-contact" name="contact" placeholder="Jane Smith" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="emp-email">Work Email <span class="required">*</span></label>
          <input type="email" id="emp-email" name="email" placeholder="jane@acme.com" required />
        </div>
        <div class="form-group">
          <label for="emp-phone">Phone Number</label>
          <input type="tel" id="emp-phone" name="phone" placeholder="(555) 000-0000" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="emp-position-type">Position Type <span class="required">*</span></label>
          <select id="emp-position-type" name="positionType" required>
            <option value="">Select type…</option>
            <option value="full-time">Full-Time</option>
            <option value="part-time">Part-Time</option>
            <option value="contract">Contract / Temp</option>
            <option value="direct-hire">Direct Hire</option>
          </select>
        </div>
        <div class="form-group">
          <label for="emp-hires">Number of Hires Needed</label>
          <input type="number" id="emp-hires" name="hires" placeholder="1" min="1" />
        </div>
      </div>
      <div class="form-group">
        <label for="emp-role-title">Role Title / Department</label>
        <input type="text" id="emp-role-title" name="roleTitle" placeholder="e.g. Data Entry Specialist — Finance" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="emp-timeline">Hiring Timeline</label>
          <select id="emp-timeline" name="timeline">
            <option value="">Select timeline…</option>
            <option value="asap">ASAP (within 2 weeks)</option>
            <option value="30-days">Within 30 days</option>
            <option value="60-days">Within 60 days</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>
        <div class="form-group">
          <label for="emp-location">Work Location</label>
          <input type="text" id="emp-location" name="location" placeholder="Dallas, TX or Remote" />
        </div>
      </div>
      <div class="form-group">
        <label for="emp-notes">Additional Notes</label>
        <textarea id="emp-notes" name="notes" placeholder="Describe the role, required skills, or any special requirements…" rows="4"></textarea>
      </div>
      <button type="submit" class="btn btn-primary btn-full">Submit Request</button>
      <p id="employer-status" class="form-status" aria-live="polite"></p>
    </form>
  `;
}

export function initEmployerForm(formId = 'employer-form') {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('employer-status');
    const submitBtn = form.querySelector('[type="submit"]');

    const company = form.querySelector('[name="company"]').value.trim();
    const contact = form.querySelector('[name="contact"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const positionType = form.querySelector('[name="positionType"]').value;

    if (!company || !contact || !email || !positionType) {
      setStatus(status, 'Please fill in all required fields.', 'error');
      return;
    }

    const hires = form.querySelector('[name="hires"]').value;
    const roleTitle = form.querySelector('[name="roleTitle"]').value.trim();
    const timeline = form.querySelector('[name="timeline"]').value;
    const location = form.querySelector('[name="location"]').value.trim();
    const notes = form.querySelector('[name="notes"]').value.trim();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';
    setStatus(status, '', '');

    try {
      await createTask({
        title: `Employer Request: ${roleTitle || positionType} — ${company}`,
        description: [
          `Company: ${company}`,
          `Contact: ${contact} (${email})`,
          `Type: ${positionType}`,
          hires ? `Hires needed: ${hires}` : '',
          timeline ? `Timeline: ${timeline}` : '',
          location ? `Location: ${location}` : '',
          notes ? `Notes: ${notes}` : ''
        ].filter(Boolean).join(' | '),
        app: 'marchLewis',
        type: 'employer-request',
        status: 'pending'
      });
      setStatus(status, '✓ Request received! A recruiter will contact you within 1 business day.', 'success');
      form.reset();
    } catch (_) {
      setStatus(status, 'Could not submit request. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Request';
    }
  });
}

function setStatus(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className = `form-status${type ? ' form-status--' + type : ''}`;
}
