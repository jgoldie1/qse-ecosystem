/* March & Lewis — Employer Intake Page */

import { initHeader } from '../components/header.js';
import { initFooter } from '../components/footer.js';
import { renderEmployerForm, initEmployerForm } from '../forms/employer-form.js';

export function initEmployerIntakePage() {
  initHeader();
  initFooter();

  const placeholder = document.getElementById('employer-form-placeholder');
  if (placeholder) {
    placeholder.outerHTML = renderEmployerForm();
    initEmployerForm();
  }
}

initEmployerIntakePage();
