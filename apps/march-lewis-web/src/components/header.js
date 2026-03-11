/* March & Lewis — Header Component */

const NAV_LINKS = [
  { href: '/march-lewis/', label: 'Home' },
  { href: '/march-lewis/jobs.html', label: 'Find Jobs' },
  { href: '/march-lewis/employer-intake.html', label: 'For Employers' },
  { href: '/march-lewis/candidate-onboarding.html', label: 'Onboarding' },
  { href: '/march-lewis/login.html', label: 'Login', className: 'btn btn-primary' }
];

export function renderHeader(currentPath = window.location.pathname) {
  const linksHtml = NAV_LINKS.map(link => {
    const isActive = currentPath === link.href || currentPath.endsWith(link.href.split('/').pop());
    const cls = link.className ? ` class="${link.className}${isActive ? ' active' : ''}"` : (isActive ? ' class="active"' : '');
    return `<a href="${link.href}"${cls}>${link.label}</a>`;
  }).join('');

  return `
    <header class="header">
      <div class="container header-inner">
        <a class="logo" href="/march-lewis/">March &amp; Lewis</a>
        <nav class="nav" id="main-nav">${linksHtml}</nav>
        <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation">&#9776;</button>
      </div>
    </header>
  `;
}

export function initHeader(currentPath) {
  const placeholder = document.getElementById('header-placeholder');
  if (!placeholder) return;
  placeholder.outerHTML = renderHeader(currentPath);

  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('nav-open');
    });
  }
}
