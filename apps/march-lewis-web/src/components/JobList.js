function escape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function JobList(jobs = []) {
  if (!jobs.length) {
    return '<p class="empty">No open positions at this time.</p>';
  }

  return `
    <div class="cards">
      ${jobs.map(j => `
        <div class="card">
          <h3>${escape(j.title || 'Open Position')}</h3>
          <p>${escape(j.location || '')}</p>
          ${j.description ? `<p>${escape(j.description)}</p>` : ''}
          ${j.type ? `<span class="badge">${escape(j.type)}</span>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

module.exports = JobList;
