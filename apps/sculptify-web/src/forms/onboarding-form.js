/* Sculptify – Therapist Onboarding form handler (ES module) */

import { api } from '/sculptify/src/api.js';
import { showToast } from '/sculptify/src/components/toast.js';

/** Specialties available for selection */
export const SPECIALTIES = [
  'Body Sculpting',
  'Massage Therapy',
  'Nutrition Coaching',
  'Personal Training',
  'Skincare & Aesthetics',
  'Yoga & Mindfulness',
  'Physical Therapy',
  'Wellness Consulting'
];

/**
 * Populate a <select> element with specialty options.
 * @param {HTMLSelectElement} selectEl
 */
export function populateSpecialtySelect(selectEl) {
  SPECIALTIES.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    opt.textContent = s;
    selectEl.appendChild(opt);
  });
}

/**
 * Initialise the multi-step onboarding form.
 *
 * The form must contain:
 *  - Elements with class `.form-step`  (each step panel)
 *  - Buttons with `data-action="next"` and `data-action="prev"`
 *  - A `.step-progress` element for "Step X of Y" text (optional)
 *  - Step indicator items with class `.step-item` (optional)
 *
 * @param {HTMLFormElement} formEl
 * @param {Function} [onSuccess]
 */
export function initOnboardingForm(formEl, onSuccess) {
  const steps    = Array.from(formEl.querySelectorAll('.form-step'));
  const nextBtns = formEl.querySelectorAll('[data-action="next"]');
  const prevBtns = formEl.querySelectorAll('[data-action="prev"]');
  const stepItems = document.querySelectorAll('.step-item');
  let current = 0;

  function showStep(idx) {
    steps.forEach((s, i) => {
      s.classList.toggle('active', i === idx);
    });

    stepItems.forEach((item, i) => {
      item.classList.remove('active', 'completed');
      if (i < idx)  item.classList.add('completed');
      if (i === idx) item.classList.add('active');
    });

    const progress = formEl.querySelector('.step-progress');
    if (progress) progress.textContent = `Step ${idx + 1} of ${steps.length}`;
  }

  showStep(0);

  nextBtns.forEach(btn =>
    btn.addEventListener('click', () => {
      if (current < steps.length - 1) {
        current++;
        showStep(current);
        formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    })
  );

  prevBtns.forEach(btn =>
    btn.addEventListener('click', () => {
      if (current > 0) {
        current--;
        showStep(current);
        formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    })
  );

  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = formEl.querySelector('[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Submitting…';

    const name        = formEl.querySelector('[name="name"]').value.trim();
    const email       = formEl.querySelector('[name="email"]').value.trim();
    const phone       = formEl.querySelector('[name="phone"]')?.value.trim() || '';
    const location    = formEl.querySelector('[name="location"]')?.value.trim() || '';
    const specialty   = formEl.querySelector('[name="specialty"]').value;
    const license     = formEl.querySelector('[name="license"]')?.value.trim() || '';
    const expEl       = formEl.querySelector('[name="experience"]');
    const experience  = expEl?.options[expEl.selectedIndex]?.text || '';
    const bio         = formEl.querySelector('[name="bio"]')?.value.trim() || '';
    const services    = formEl.querySelector('[name="services"]')?.value.trim() || '';
    const rate        = formEl.querySelector('[name="rate"]')?.value.trim() || '';

    try {
      await api.tasks.create({
        title: `Therapist Application: ${name}`,
        description: [
          `Email: ${email}`,
          phone      ? `Phone: ${phone}`              : '',
          location   ? `Location: ${location}`        : '',
          `Specialty: ${specialty}`,
          license    ? `License #: ${license}`        : '',
          experience ? `Experience: ${experience}`    : '',
          bio        ? `Bio: ${bio}`                  : '',
          services   ? `Services: ${services}`        : '',
          rate       ? `Rate: ${rate}`                : ''
        ].filter(Boolean).join('\n'),
        app: 'sculptify',
        type: 'therapist_onboarding',
        status: 'pending_review'
      });

      showToast('Application submitted! Our team will be in touch within 2 business days.');
      formEl.reset();
      current = 0;
      showStep(0);
      if (typeof onSuccess === 'function') onSuccess();
    } catch {
      showToast('Could not submit application. Please try again.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}
