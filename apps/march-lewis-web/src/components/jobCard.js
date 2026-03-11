/**
 * jobCard – renders a single job posting card
 * @param {Object} job
 * @returns {string} HTML string
 */
export function jobCard(job) {
  return `
    <div class="card" data-job-id="${job.id}">
      <div class="card-icon">${job.icon || '💼'}</div>
      <h3>${job.title}</h3>
      <p>${job.type} &mdash; ${job.location}</p>
      <a href="#apply" class="btn btn-outline">Apply Now</a>
    </div>
  `;
}
