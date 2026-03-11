/* March & Lewis — Header component */

import { getSession, clearSession } from '../api/client.js';

export function mountHeader(activePage = '') {
  const el = document.getElementById('app-header');
  if (!el) return;

  const session = getSession();
  const dashboardHref =
    session?.role === 'admin'     ? '/march-lewis/admin-dashboard.html' :
    session?.role === 'recruiter' ? '/march-lewis/recruiter-dashboard.html' : '';

  el.innerHTML = `
    <header class="header">
      <div class="container">
        <a href="/march-lewis/" class="logo">March &amp; Lewis</a>
        <nav class="nav" id="main-nav">
          <a href="/march-lewis/" class="${activePage === 'home' ? 'nav-active' : ''}">Home</a>
          <a href="/march-lewis/jobs.html" class="${activePage === 'jobs' ? 'nav-active' : ''}">Find Jobs</a>
          <a href="/march-lewis/employer-intake.html" class="${activePage === 'employer' ? 'nav-active' : ''}">For Employers</a>
          ${session ? `
            ${dashboardHref ? `<a href="${dashboardHref}" class="btn btn-outline">Dashboard</a>` : ''}
            <button class="btn btn-outline" id="logout-btn">Sign Out</button>
          ` : `
            <a href="/march-lewis/login.html" class="${activePage === 'login' ? 'btn btn-outline nav-active' : 'btn btn-outline'}">Login</a>
            <a href="/march-lewis/candidate-onboarding.html" class="btn btn-primary">Get Started</a>
          `}
        </nav>
        <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation">&#9776;</button>
      </div>
    </header>
  `;

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    clearSession();
    window.location.href = '/march-lewis/login.html';
  });

  document.getElementById('nav-toggle')?.addEventListener('click', () => {
    document.getElementById('main-nav')?.classList.toggle('nav-open');
  });
}
