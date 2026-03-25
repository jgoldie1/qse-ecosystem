/* Sculptify – Booking form handler (ES module) */

import { api } from '/sculptify/src/api.js';
import { showToast } from '/sculptify/src/components/toast.js';

/** Static service catalogue (used to populate service <select> elements). */
export const SERVICES = [
  { value: 'body-sculpting',   label: 'Body Sculpting',        duration: '60 min' },
  { value: 'nutrition',        label: 'Nutrition Coaching',     duration: '45 min' },
  { value: 'personal-training',label: 'Personal Training',      duration: '60 min' },
  { value: 'massage',          label: 'Therapeutic Massage',    duration: '60 min' },
  { value: 'skincare',         label: 'Skincare Treatment',     duration: '45 min' },
  { value: 'wellness-consult', label: 'Wellness Consultation',  duration: '30 min' }
];

/**
 * Populate a <select> element with service options.
 * @param {HTMLSelectElement} selectEl
 */
export function populateServiceSelect(selectEl) {
  SERVICES.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.value;
    opt.textContent = `${s.label} (${s.duration})`;
    selectEl.appendChild(opt);
  });
}

/**
 * Attach submit handler to a booking form element.
 * On success the form resets and shows a success toast.
 * @param {HTMLFormElement} formEl
 * @param {Function} [onSuccess] – Optional callback called after successful submit
 */
export function initBookingForm(formEl, onSuccess) {
  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = formEl.querySelector('[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Submitting…';

    const name     = formEl.querySelector('[name="name"]').value.trim();
    const email    = formEl.querySelector('[name="email"]').value.trim();
    const phone    = formEl.querySelector('[name="phone"]')?.value.trim() || '';
    const service  = formEl.querySelector('[name="service"]').value;
    const provider = formEl.querySelector('[name="provider"]')?.value || '';
    const date     = formEl.querySelector('[name="date"]')?.value || '';
    const time     = formEl.querySelector('[name="time"]')?.value || '';
    const notes    = formEl.querySelector('[name="notes"]')?.value.trim() || '';

    try {
      await api.tasks.create({
        title: `Booking: ${service}`,
        description: [
          `Name: ${name}`,
          `Email: ${email}`,
          phone    ? `Phone: ${phone}` : '',
          provider ? `Provider: ${provider}` : '',
          date     ? `Date: ${date}` : '',
          time     ? `Time: ${time}` : '',
          notes    ? `Notes: ${notes}` : ''
        ].filter(Boolean).join('\n'),
        app: 'sculptify',
        type: 'booking',
        status: 'pending'
      });

      showToast('Booking request submitted! We will contact you shortly.');
      formEl.reset();
      if (typeof onSuccess === 'function') onSuccess();
    } catch {
      showToast('Could not submit booking. Please try again.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}
