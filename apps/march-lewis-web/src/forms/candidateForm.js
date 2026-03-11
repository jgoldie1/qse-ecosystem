/* March & Lewis — Multi-step candidate onboarding form */

import { fetchJSON, API_BASE, setSession } from '../api/client.js';
import { showToast } from '../components/toast.js';

const TOTAL_STEPS = 4;
let currentStep = 1;
const formData = {};

export function initCandidateForm() {
  if (!document.getElementById('candidate-form')) return;

  showStep(currentStep);

  document.getElementById('next-btn')?.addEventListener('click', () => {
    if (validateStep(currentStep)) {
      collectStep(currentStep);
      currentStep++;
      showStep(currentStep);
    }
  });

  document.getElementById('prev-btn')?.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      showStep(currentStep);
    }
  });

  document.getElementById('candidate-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    collectStep(currentStep);

    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.textContent = 'Creating Profile\u2026';

    try {
      await fetchJSON(`${API_BASE}/tasks`, {
        method: 'POST',
        body: JSON.stringify({
          title: `Candidate: ${formData.firstName} ${formData.lastName}`,
          description: `Skills: ${formData.skills || 'N/A'}. Experience: ${formData.experience || 'N/A'}.`,
          app: 'marchLewis',
          type: 'candidate_onboarding',
          ...formData,
        }),
      });

      setSession({
        userId: 'c-' + Math.random().toString(36).slice(2, 8),
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        role: 'candidate',
      });

      showToast('Profile created! Welcome to March & Lewis.', 'success');
      setTimeout(() => { window.location.href = '/march-lewis/jobs.html'; }, 1500);
    } catch {
      showToast('Could not create profile. Please try again.', 'error');
      btn.disabled = false;
      btn.textContent = 'Complete Profile';
    }
  });
}

function showStep(step) {
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    document.getElementById(`step-${i}`)?.classList.toggle('active', i === step);
  }

  const prevBtn   = document.getElementById('prev-btn');
  const nextBtn   = document.getElementById('next-btn');
  const submitBtn = document.getElementById('submit-btn');

  if (prevBtn)   prevBtn.style.display   = step > 1              ? '' : 'none';
  if (nextBtn)   nextBtn.style.display   = step < TOTAL_STEPS    ? '' : 'none';
  if (submitBtn) submitBtn.style.display = step === TOTAL_STEPS  ? '' : 'none';

  document.querySelectorAll('.step-dot').forEach((dot, i) => {
    dot.classList.toggle('done',   i + 1 < step);
    dot.classList.toggle('active', i + 1 === step);
  });

  const counter = document.getElementById('step-counter');
  if (counter) counter.textContent = `Step ${step} of ${TOTAL_STEPS}`;
}

function validateStep(step) {
  const panel = document.getElementById(`step-${step}`);
  if (!panel) return true;
  let valid = true;
  panel.querySelectorAll('[required]').forEach((f) => {
    if (!f.value.trim()) {
      f.classList.add('field-error');
      valid = false;
    } else {
      f.classList.remove('field-error');
    }
  });
  if (!valid) showToast('Please fill in all required fields.', 'error');
  return valid;
}

function collectStep(step) {
  const panel = document.getElementById(`step-${step}`);
  if (!panel) return;
  panel.querySelectorAll('[name]').forEach((f) => {
    formData[f.name] = f.value;
  });
}
