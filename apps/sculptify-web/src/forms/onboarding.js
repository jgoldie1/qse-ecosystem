/* Sculptify – Provider Onboarding Form Module */

const API_BASE = '/api';

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Bind submit handler to the onboarding form (#onboarding-form).
 * POSTs provider application to /api/onboarding.
 */
export function initOnboardingForm() {
  const form = document.getElementById('onboarding-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('onboarding-status');
    const name = document.getElementById('onboard-name').value.trim();
    const email = document.getElementById('onboard-email').value.trim();
    const specialty = document.getElementById('onboard-specialty').value;
    const experience = document.getElementById('onboard-experience').value.trim();

    if (status) {
      status.style.color = '';
      status.textContent = 'Submitting…';
    }

    try {
      const result = await fetchJSON(`${API_BASE}/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, specialty, experience })
      });

      if (result.success) {
        if (status) {
          status.style.color = '#4ade80';
          status.textContent = 'Application submitted! Our team will review it and contact you within 2 business days.';
        }
        form.reset();
      }
    } catch {
      if (status) {
        status.style.color = '#f87171';
        status.textContent = 'Could not submit application. Please try again.';
      }
    }
  });
}
