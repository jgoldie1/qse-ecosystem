/* March & Lewis — Candidate Onboarding Form */
import { api } from '../api/client.js';

/**
 * Renders the candidate onboarding form into the given container element.
 * On submit it POSTs a task for onboarding and optionally enrolls in a course.
 *
 * @param {HTMLElement} container
 */
export function renderCandidateOnboardingForm(container) {
  container.innerHTML = `
    <form class="form" id="onboarding-form" novalidate>
      <h2 style="text-align:center;margin-bottom:8px">Candidate Onboarding</h2>
      <p style="text-align:center;color:var(--text-muted);margin-bottom:24px">
        Complete your profile so we can match you with the right opportunities.
      </p>

      <label class="form-label">Full Name <span class="required">*</span></label>
      <input type="text" id="ob-name" placeholder="Jane Smith" required />

      <label class="form-label">Email Address <span class="required">*</span></label>
      <input type="email" id="ob-email" placeholder="jane@example.com" required />

      <label class="form-label">Phone Number</label>
      <input type="tel" id="ob-phone" placeholder="+1 (555) 000-0000" />

      <label class="form-label">City / Location <span class="required">*</span></label>
      <input type="text" id="ob-location" placeholder="Dallas, TX" required />

      <label class="form-label">Work Authorization</label>
      <select id="ob-auth">
        <option value="">— Select —</option>
        <option>US Citizen</option>
        <option>Permanent Resident (Green Card)</option>
        <option>H1-B Visa</option>
        <option>OPT / STEM OPT</option>
        <option>Other / Requires Sponsorship</option>
      </select>

      <label class="form-label">Primary Job Category <span class="required">*</span></label>
      <select id="ob-category" required>
        <option value="">— Select category —</option>
        <option>Administrative / Clerical</option>
        <option>Information Technology</option>
        <option>Healthcare</option>
        <option>Finance &amp; Accounting</option>
        <option>Customer Service</option>
        <option>Operations &amp; Logistics</option>
        <option>Other</option>
      </select>

      <label class="form-label">Years of Experience</label>
      <select id="ob-experience">
        <option value="">— Select —</option>
        <option>0–1 years (Entry Level)</option>
        <option>1–3 years</option>
        <option>3–5 years</option>
        <option>5–10 years</option>
        <option>10+ years</option>
      </select>

      <label class="form-label">Desired Employment Type</label>
      <select id="ob-emp-type">
        <option value="">— Select —</option>
        <option>Full-time</option>
        <option>Part-time</option>
        <option>Contract</option>
        <option>Temporary</option>
        <option>Open to All</option>
      </select>

      <label class="form-label">Enroll in a Training Course</label>
      <select id="ob-course">
        <option value="">— Skip for now —</option>
      </select>

      <label class="form-label">Brief Bio / Skills Summary</label>
      <textarea id="ob-bio" placeholder="Describe your skills, experience, and what you are looking for…" rows="4"></textarea>

      <button type="submit" class="btn btn-primary" style="width:100%">Complete Onboarding</button>
      <p id="ob-status" class="form-status" aria-live="polite"></p>
    </form>
  `;

  // Populate courses from API
  api.getCourses().then((courses) => {
    const select = document.getElementById('ob-course');
    const ml = courses.filter((c) => c.app === 'marchLewis' || c.app === 'general');
    ml.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.title;
      select.appendChild(opt);
    });
  }).catch(() => {});

  document.getElementById('onboarding-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('ob-status');
    const name = document.getElementById('ob-name').value.trim();
    const email = document.getElementById('ob-email').value.trim();
    const location = document.getElementById('ob-location').value.trim();
    const category = document.getElementById('ob-category').value;
    const courseId = document.getElementById('ob-course').value;

    if (!name || !email || !location || !category) {
      status.style.color = '#f87171';
      status.textContent = 'Please fill in all required fields.';
      return;
    }

    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Saving…';
    status.style.color = '';
    status.textContent = '';

    try {
      await api.createTask({
        title: `Candidate Onboarding: ${name}`,
        description: `Email: ${email}. Location: ${location}. Category: ${category}. Experience: ${document.getElementById('ob-experience').value}. Type: ${document.getElementById('ob-emp-type').value}. Bio: ${document.getElementById('ob-bio').value.trim()}`,
        app: 'marchLewis',
        type: 'candidateOnboarding',
        status: 'new',
      });

      if (courseId) {
        const userId = `candidate-${Date.now()}`;
        await api.enrollCourse(userId, courseId);
      }

      status.style.color = '#4ade80';
      status.textContent = 'Your profile has been saved! Our team will review your information and reach out soon.';
      e.target.reset();
    } catch (err) {
      status.style.color = '#f87171';
      status.textContent = 'Could not save your profile. Please try again.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Complete Onboarding';
    }
  });
}
