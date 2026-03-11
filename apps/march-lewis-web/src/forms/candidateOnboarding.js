/**
 * candidateOnboarding – handles the candidate application form submission
 */
export function initCandidateOnboarding(apiBase) {
  const form = document.getElementById('apply-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('apply-status');

    const phoneEl = document.getElementById('apply-phone');
    const payload = {
      name:       document.getElementById('apply-name').value.trim(),
      email:      document.getElementById('apply-email').value.trim(),
      phone:      phoneEl ? phoneEl.value.trim() : '',
      role:       document.getElementById('apply-role').value.trim(),
      experience: document.getElementById('apply-message').value.trim()
    };

    try {
      const res = await fetch(`${apiBase}/march-lewis/candidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (result.success) {
        status.style.color = '';
        status.textContent = 'Your application has been received! Our team will be in touch within 2 business days.';
        form.reset();
      } else {
        status.style.color = '#f87171';
        status.textContent = result.error || 'Could not submit application. Please try again.';
      }
    } catch {
      status.style.color = '#f87171';
      status.textContent = 'Could not submit application. Please try again.';
    }
  });
}
