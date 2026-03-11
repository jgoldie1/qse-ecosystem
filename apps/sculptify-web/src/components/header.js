/* Sculptify – Header component (ES module) */

/**
 * Navigation link definitions. href values use absolute paths so they work
 * regardless of which page the component is rendered on.
 */
const NAV_LINKS = [
  { label: 'Home',           href: '/sculptify/src/pages/home.html',                  page: 'home' },
  { label: 'Providers',      href: '/sculptify/src/pages/providers.html',              page: 'providers' },
  { label: 'Book',           href: '/sculptify/src/pages/booking.html',               page: 'booking' },
  { label: 'Join as Therapist', href: '/sculptify/src/pages/therapist-onboarding.html', page: 'onboarding' }
];

/**
 * Build the header HTML string.
 * @param {string} activePage  – matches the `page` field in NAV_LINKS
 * @returns {string}
 */
export function renderHeader(activePage = '') {
  const isAdmin = typeof localStorage !== 'undefined' &&
                  localStorage.getItem('sculptify_role') === 'admin';

  const links = [...NAV_LINKS];
  if (isAdmin) {
    links.push({ label: 'Admin', href: '/sculptify/src/pages/admin.html', page: 'admin' });
  }

  const navItems = links.map(item =>
    `<a href="${item.href}" class="${item.page === activePage ? 'active' : ''}">${item.label}</a>`
  ).join('\n          ');

  const authLabel = isAdmin
    ? 'Logout'
    : (localStorage.getItem('sculptify_user') ? 'Logout' : 'Login');
  const authHref = (isAdmin || localStorage.getItem('sculptify_user'))
    ? '#logout'
    : '/sculptify/src/pages/login.html';

  return `
  <header class="header">
    <div class="container">
      <a href="/sculptify/src/pages/home.html" class="logo">Sculptify</a>
      <nav class="nav" id="main-nav">
        ${navItems}
        <a href="${authHref}" id="nav-auth">${authLabel}</a>
      </nav>
      <button class="nav-toggle" aria-label="Toggle navigation" id="nav-toggle">&#9776;</button>
    </div>
  </header>`;
}

/**
 * Inject the header at the top of <body> and wire up interactions.
 * @param {string} activePage
 */
export function initHeader(activePage = '') {
  document.body.insertAdjacentHTML('afterbegin', renderHeader(activePage));

  // Mobile nav toggle
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }

  // Logout handler
  const authLink = document.getElementById('nav-auth');
  if (authLink && authLink.getAttribute('href') === '#logout') {
    authLink.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('sculptify_user');
      localStorage.removeItem('sculptify_role');
      window.location.href = '/sculptify/src/pages/login.html';
    });
  }
}
