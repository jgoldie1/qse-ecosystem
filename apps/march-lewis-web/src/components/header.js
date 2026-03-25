/* March & Lewis — Header Component */

const BASE = '/march-lewis';

const NAV_LINKS = [
  { href: `${BASE}/`, label: 'Home' },
  { href: `${BASE}/jobs.html`, label: 'Find Jobs' },
  { href: `${BASE}/employer-intake.html`, label: 'For Employers' },
  { href: `${BASE}/candidate-onboarding.html`, label: 'Get Started' },
];

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('ml_user') || 'null');
  } catch {
    return null;
  }
}

function isActive(href) {
  const path = window.location.pathname;
  if (href === `${BASE}/`) return path === `${BASE}` || path === `${BASE}/` || path === `${BASE}/index.html`;
  return path.startsWith(href.replace(BASE, '')) || path === href.replace(BASE, '');
}

export function renderHeader() {
  const user = getUser();

  const authHtml = user
    ? `<a href="${BASE}/${user.role === 'admin' ? 'admin-dashboard' : 'recruiter-dashboard'}.html" class="btn btn-outline" style="padding:8px 16px">Dashboard</a>
       <button class="btn btn-primary" id="ml-logout" style="padding:8px 16px">Logout</button>`
    : `<a href="${BASE}/login.html" class="btn btn-primary" style="padding:8px 16px">Sign In</a>`;

  const navLinksHtml = NAV_LINKS.map(
    (l) => `<a href="${l.href}"${isActive(l.href) ? ' class="active"' : ''}>${l.label}</a>`
  ).join('');

  const header = document.createElement('header');
  header.className = 'header';
  header.innerHTML = `
    <div class="container">
      <a href="${BASE}/" class="logo" style="text-decoration:none">March &amp; Lewis</a>
      <nav class="nav" id="ml-nav">
        ${navLinksHtml}
        <span class="nav-auth">${authHtml}</span>
      </nav>
      <button class="nav-toggle" id="ml-nav-toggle" aria-label="Toggle menu">☰</button>
    </div>
  `;

  document.body.prepend(header);

  document.getElementById('ml-nav-toggle').addEventListener('click', () => {
    document.getElementById('ml-nav').classList.toggle('nav-open');
  });

  const logoutBtn = document.getElementById('ml-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('ml_user');
      window.location.href = `${BASE}/`;
    });
  }
}
