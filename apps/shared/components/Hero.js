function escape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function Hero({ pill = '', title = '', description = '', actions = [] } = {}) {
  const actionButtons = actions.map(a =>
    `<a href="${escape(a.href)}" class="btn ${escape(a.variant)}">${escape(a.label)}</a>`
  ).join('\n      ');

  return `
    <section class="hero">
      <div class="container">
        ${pill ? `<span class="pill">${escape(pill)}</span>` : ''}
        <h1>${escape(title)}</h1>
        ${description ? `<p>${escape(description)}</p>` : ''}
        ${actions.length ? `<div class="hero-actions">${actionButtons}</div>` : ''}
      </div>
    </section>
  `;
}

module.exports = Hero;
