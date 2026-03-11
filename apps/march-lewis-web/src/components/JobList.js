const { escapeHtml } = require('../../../../shared/utils/escape');

function JobList(jobs = [], interviews = []) {
  return `
    <div class="cards">
      ${jobs.map((job) => `
        <div class="card">
          <h3>${escapeHtml(job.title || '')}</h3>
          <p>${escapeHtml(job.type || '')}</p>
          <span>${escapeHtml(job.location || '')}</span>
          <p>${interviews.length ? `Interviews scheduled: ${escapeHtml(interviews.length)}` : 'No interviews scheduled yet'}</p>
        </div>
      `).join('')}
    </div>
  `;
}

module.exports = JobList;
