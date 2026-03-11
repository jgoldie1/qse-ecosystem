/* March & Lewis — Candidate Onboarding Page */

import { initHeader } from '../components/header.js';
import { initFooter } from '../components/footer.js';
import { renderCandidateForm, initCandidateForm } from '../forms/candidate-form.js';

export function initCandidateOnboardingPage() {
  initHeader();
  initFooter();

  const placeholder = document.getElementById('candidate-form-placeholder');
  if (placeholder) {
    placeholder.outerHTML = renderCandidateForm();
    initCandidateForm();
  }
}

initCandidateOnboardingPage();
