/* March & Lewis — Apply Form */

import { createTask } from '../api.js';

export function renderApplyForm(formId = 'apply-form') {
  return `
    <form class="form" id="${formId}" novalidate>
      <div class="form-group">
        <label for="apply-name">Full Name <span class="required">*</span></label>
        <input type="text" id="apply-name" name="name" placeholder="Your Full Name" required />
      </div>
      <div class="form-group">
        <label for="apply-email">Email Address <span class="required">*</span></label>
        <input type="email" id="apply-email" name="email" placeholder="you@example.com" required />
      </div>
      <div class="form-group">
        <label for="apply-phone">Phone Number</label>
        <input type="tel" id="apply-phone" name="phone" placeholder="(555) 000-0000" />
      </div>
      <div class="form-group">
        <label for="apply-role">Position Applying For</label>
        <input type="text" id="apply-role" name="role" placeholder="e.g. Administrative Assistant" />
      </div>
      <div class="form-group">
        <label for="apply-message">Tell Us About Yourself</label>
        <textarea id="apply-message" name="message" placeholder="Briefly describe your experience and goals..." rows="4"></textarea>
      </div>
      <button type="submit" class="btn btn-primary btn-full">Submit Application</button>
      <p id="apply-status" class="form-status" aria-live="polite"></p>
    </form>
  `;
}

export function initApplyForm(formId = 'apply-form') {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('apply-status');
    const submitBtn = form.querySelector('[type="submit"]');

    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const role = form.querySelector('[name="role"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();

    if (!name || !email) {
      setStatus(status, 'Please fill in your name and email.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';
    setStatus(status, '', '');

    try {
      await createTask({
        title: `Job Application: ${role || 'Open Position'}`,
        description: `Applicant: ${name} (${email})${message ? ' — ' + message : ''}`,
        app: 'marchLewis',
        type: 'application',
        status: 'pending'
      });
      setStatus(status, '✓ Application received! Our team will be in touch within 2 business days.', 'success');
      form.reset();
    } catch (_) {
      setStatus(status, 'Could not submit application. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Application';
    }
  });
}

function setStatus(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className = `form-status${type ? ' form-status--' + type : ''}`;
}
