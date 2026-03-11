/* March & Lewis — Login Page */

import { initHeader } from '../components/header.js';
import { initFooter } from '../components/footer.js';
import { renderLoginForm, initLoginForm } from '../forms/login-form.js';

export function initLoginPage() {
  initHeader();
  initFooter();

  const placeholder = document.getElementById('login-form-placeholder');
  if (placeholder) {
    placeholder.outerHTML = renderLoginForm();
    initLoginForm();
  }
}

initLoginPage();
