function escape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function ProviderList(providers = []) {
  if (!providers.length) {
    return '<p class="empty">No providers available at this time.</p>';
  }

  return `
    <div class="cards">
      ${providers.map(p => `
        <div class="card">
          <h3>${escape(p.name || 'Provider')}</h3>
          <p>${escape(p.specialty || '')}</p>
          ${p.bio ? `<p class="bio">${escape(p.bio)}</p>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

module.exports = ProviderList;
