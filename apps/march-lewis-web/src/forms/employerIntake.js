/**
 * employerIntake – handles the employer intake form submission
 */
export function initEmployerIntake(apiBase) {
  const form = document.getElementById('employer-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('employer-status');

    const payload = {
      company:   document.getElementById('employer-company').value.trim(),
      contact:   document.getElementById('employer-contact').value.trim(),
      email:     document.getElementById('employer-email').value.trim(),
      positions: document.getElementById('employer-positions').value.trim(),
      notes:     document.getElementById('employer-notes').value.trim()
    };

    try {
      const res = await fetch(`${apiBase}/march-lewis/employer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (result.success) {
        status.style.color = '';
        status.textContent = 'Request received! Our team will contact you within 1 business day.';
        form.reset();
      } else {
        status.style.color = '#f87171';
        status.textContent = result.error || 'Submission failed. Please try again.';
      }
    } catch {
      status.style.color = '#f87171';
      status.textContent = 'Could not submit. Please try again.';
    }
  });
}
