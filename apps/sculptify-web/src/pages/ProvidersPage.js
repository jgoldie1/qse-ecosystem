const Header = require('../../../shared/components/Header');

function ProvidersPage(content = '') {
  return `
    <div class="page-shell">
      ${Header({
        title: 'Providers',
        subtitle: 'Browse Sculptify therapists and specialists'
      })}
      <section class="panel">
        <h2>Provider Listings</h2>
        ${content}
      </section>
    </div>
  `;
}

module.exports = ProvidersPage;
