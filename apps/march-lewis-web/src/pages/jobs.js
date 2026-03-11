/* March & Lewis — Jobs listing page */

import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { JOBS, CATEGORIES, JOB_TYPES } from '../data/jobs.js';

mountHeader('jobs');
mountFooter();

/* ── Populate filter dropdowns ── */
const catSel = document.getElementById('filter-category');
CATEGORIES.forEach(({ value, label }) => {
  const opt = document.createElement('option');
  opt.value = value;
  opt.textContent = label;
  catSel.appendChild(opt);
});

const typeSel = document.getElementById('filter-type');
JOB_TYPES.forEach(({ value, label }) => {
  const opt = document.createElement('option');
  opt.value = value;
  opt.textContent = label;
  typeSel.appendChild(opt);
});

/* ── Render helpers ── */
function renderJobs(jobs) {
  const grid = document.getElementById('jobs-grid');
  if (!jobs.length) {
    grid.innerHTML =
      '<p class="loading">No positions match your search. Try adjusting your filters.</p>';
    return;
  }
  grid.innerHTML = jobs
    .map(
      (j) => `
    <div class="card job-card">
      <div class="job-card-header">
        <span class="card-icon">${j.icon}</span>
        <span class="job-badge">${j.type}</span>
      </div>
      <h3>${j.title}</h3>
      <p class="job-company">${j.company}</p>
      <p class="job-meta">&#128205; ${j.location} &nbsp;&middot;&nbsp; &#128176; ${j.salary}</p>
      <p class="job-desc">${j.description}</p>
      <a href="/march-lewis/#apply" class="btn btn-outline">Apply Now</a>
    </div>`
    )
    .join('');
}

function applyFilters() {
  const search   = document.getElementById('search-input').value.toLowerCase();
  const category = document.getElementById('filter-category').value;
  const type     = document.getElementById('filter-type').value;

  const filtered = JOBS.filter((j) => {
    const matchSearch =
      !search ||
      j.title.toLowerCase().includes(search) ||
      j.company.toLowerCase().includes(search) ||
      j.location.toLowerCase().includes(search) ||
      j.description.toLowerCase().includes(search);
    return matchSearch && (!category || j.category === category) && (!type || j.type === type);
  });

  document.getElementById('result-count').textContent =
    `${filtered.length} position${filtered.length !== 1 ? 's' : ''} found`;
  renderJobs(filtered);
}

/* ── Event listeners ── */
document.getElementById('search-input').addEventListener('input', applyFilters);
document.getElementById('filter-category').addEventListener('change', applyFilters);
document.getElementById('filter-type').addEventListener('change', applyFilters);
document.getElementById('search-btn').addEventListener('click', applyFilters);

/* ── Initial render ── */
renderJobs(JOBS);
document.getElementById('result-count').textContent = `${JOBS.length} positions found`;
