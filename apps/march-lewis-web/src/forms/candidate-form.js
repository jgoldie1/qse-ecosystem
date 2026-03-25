/* March & Lewis — Candidate Onboarding Form */

import { createTask } from '../api.js';

export function renderCandidateForm(formId = 'candidate-form') {
  return `
    <form class="form form--wide" id="${formId}" novalidate>
      <div class="form-section">
        <h3 class="form-section-title">Personal Information</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="cand-first">First Name <span class="required">*</span></label>
            <input type="text" id="cand-first" name="firstName" placeholder="First" required />
          </div>
          <div class="form-group">
            <label for="cand-last">Last Name <span class="required">*</span></label>
            <input type="text" id="cand-last" name="lastName" placeholder="Last" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="cand-email">Email Address <span class="required">*</span></label>
            <input type="email" id="cand-email" name="email" placeholder="you@example.com" required />
          </div>
          <div class="form-group">
            <label for="cand-phone">Phone Number</label>
            <input type="tel" id="cand-phone" name="phone" placeholder="(555) 000-0000" />
          </div>
        </div>
        <div class="form-group">
          <label for="cand-location">City / State</label>
          <input type="text" id="cand-location" name="location" placeholder="Dallas, TX" />
        </div>
      </div>

      <div class="form-section">
        <h3 class="form-section-title">Work Preferences</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="cand-role">Desired Role / Job Title</label>
            <input type="text" id="cand-role" name="desiredRole" placeholder="e.g. Administrative Assistant" />
          </div>
          <div class="form-group">
            <label for="cand-type">Employment Type</label>
            <select id="cand-type" name="employmentType">
              <option value="">Select…</option>
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
              <option value="contract">Contract / Temp</option>
              <option value="any">Open to Any</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="cand-availability">Available to Start</label>
            <select id="cand-availability" name="availability">
              <option value="">Select…</option>
              <option value="immediately">Immediately</option>
              <option value="2-weeks">2 Weeks Notice</option>
              <option value="30-days">30 Days</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
          <div class="form-group">
            <label for="cand-remote">Work Setting Preference</label>
            <select id="cand-remote" name="workSetting">
              <option value="">Select…</option>
              <option value="onsite">On-Site</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="any">No Preference</option>
            </select>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3 class="form-section-title">Background</h3>
        <div class="form-group">
          <label for="cand-experience">Years of Experience</label>
          <select id="cand-experience" name="experience">
            <option value="">Select…</option>
            <option value="0-1">Less than 1 year</option>
            <option value="1-3">1–3 years</option>
            <option value="3-5">3–5 years</option>
            <option value="5-10">5–10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>
        <div class="form-group">
          <label for="cand-skills">Key Skills</label>
          <input type="text" id="cand-skills" name="skills" placeholder="e.g. Microsoft Office, Customer Service, Data Entry" />
        </div>
        <div class="form-group">
          <label for="cand-bio">Brief Summary</label>
          <textarea id="cand-bio" name="bio" placeholder="Share a brief summary of your background and career goals…" rows="4"></textarea>
        </div>
      </div>

      <button type="submit" class="btn btn-primary btn-full">Complete Onboarding</button>
      <p id="candidate-status" class="form-status" aria-live="polite"></p>
    </form>
  `;
}

export function initCandidateForm(formId = 'candidate-form') {
  const form = document.getElementById(formId);
  if (!form) return;

  // Pre-fill role from query param if present
  const params = new URLSearchParams(window.location.search);
  const preRole = params.get('role');
  if (preRole) {
    const roleInput = form.querySelector('[name="desiredRole"]');
    if (roleInput) roleInput.value = preRole;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('candidate-status');
    const submitBtn = form.querySelector('[type="submit"]');

    const firstName = form.querySelector('[name="firstName"]').value.trim();
    const lastName = form.querySelector('[name="lastName"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();

    if (!firstName || !lastName || !email) {
      setStatus(status, 'Please fill in your name and email.', 'error');
      return;
    }

    const fields = {
      name: `${firstName} ${lastName}`,
      email,
      phone: form.querySelector('[name="phone"]').value.trim(),
      location: form.querySelector('[name="location"]').value.trim(),
      desiredRole: form.querySelector('[name="desiredRole"]').value.trim(),
      employmentType: form.querySelector('[name="employmentType"]').value,
      availability: form.querySelector('[name="availability"]').value,
      workSetting: form.querySelector('[name="workSetting"]').value,
      experience: form.querySelector('[name="experience"]').value,
      skills: form.querySelector('[name="skills"]').value.trim(),
      bio: form.querySelector('[name="bio"]').value.trim()
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';
    setStatus(status, '', '');

    try {
      await createTask({
        title: `Candidate Onboarding: ${fields.name}${fields.desiredRole ? ' — ' + fields.desiredRole : ''}`,
        description: Object.entries(fields)
          .filter(([, v]) => v)
          .map(([k, v]) => `${k}: ${v}`)
          .join(' | '),
        app: 'marchLewis',
        type: 'candidate-onboarding',
        status: 'pending'
      });
      setStatus(status, '✓ Profile received! A recruiter will review your information and reach out soon.', 'success');
      form.reset();
    } catch (_) {
      setStatus(status, 'Could not submit profile. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Complete Onboarding';
    }
  });
}

function setStatus(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className = `form-status${type ? ' form-status--' + type : ''}`;
}
