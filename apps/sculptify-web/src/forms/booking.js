/* Sculptify – Booking Form Module */

const API_BASE = '/api';

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * Bind submit handler to the booking form (#booking-form).
 * On success, POST a task to /api/tasks and display confirmation.
 */
export function initBookingForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('booking-status');
    const name = document.getElementById('book-name').value.trim();
    const email = document.getElementById('book-email').value.trim();
    const service = document.getElementById('book-service').value;

    if (status) {
      status.style.color = '';
      status.textContent = 'Submitting…';
    }

    try {
      await fetchJSON(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Appointment: ${service || 'General'}`,
          description: `Booking request from ${name} (${email})`,
          app: 'sculptify'
        })
      });
      if (status) {
        status.style.color = '#4ade80';
        status.textContent = 'Your appointment request has been received! We will be in touch shortly.';
      }
      form.reset();
    } catch {
      if (status) {
        status.style.color = '#f87171';
        status.textContent = 'Could not submit request. Please try again.';
      }
    }
  });
}
