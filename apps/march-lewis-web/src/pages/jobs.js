/* March & Lewis — Jobs Page */

import { initHeader } from '../components/header.js';
import { initFooter } from '../components/footer.js';
import { createJobCard } from '../components/card.js';

// Static job listings (extend when a jobs API endpoint is available)
const JOBS = [
  { id: 'job-001', title: 'Administrative Assistant', type: 'Full-Time', location: 'Dallas, TX', icon: '👔', industry: 'Office' },
  { id: 'job-002', title: 'IT Support Specialist', type: 'Full-Time', location: 'Remote', icon: '💻', industry: 'Technology' },
  { id: 'job-003', title: 'Healthcare Coordinator', type: 'Part-Time', location: 'Houston, TX', icon: '🏥', industry: 'Healthcare' },
  { id: 'job-004', title: 'Customer Service Representative', type: 'Full-Time', location: 'Atlanta, GA', icon: '📞', industry: 'Office' },
  { id: 'job-005', title: 'Data Entry Specialist', type: 'Part-Time', location: 'Remote', icon: '🖥️', industry: 'Technology' },
  { id: 'job-006', title: 'HR Generalist', type: 'Full-Time', location: 'Austin, TX', icon: '🤝', industry: 'Office' },
  { id: 'job-007', title: 'Medical Billing Coder', type: 'Full-Time', location: 'Dallas, TX', icon: '🏨', industry: 'Healthcare' },
  { id: 'job-008', title: 'Warehouse Associate', type: 'Contract', location: 'Fort Worth, TX', icon: '📦', industry: 'Logistics' },
  { id: 'job-009', title: 'Payroll Specialist', type: 'Full-Time', location: 'Hybrid — Houston, TX', icon: '💰', industry: 'Finance' }
];

export function initJobsPage() {
  initHeader();
  initFooter();
  renderFilters();
  renderJobs(JOBS);
  initFilters();
}

function renderFilters() {
  const container = document.getElementById('filters-placeholder');
  if (!container) return;
  const types = ['All', ...new Set(JOBS.map(j => j.type))];
  const industries = ['All Industries', ...new Set(JOBS.map(j => j.industry))];

  container.innerHTML = `
    <div class="filters">
      <div class="filter-group">
        <label for="filter-type" class="sr-only">Employment Type</label>
        <select id="filter-type" class="filter-select">
          ${types.map(t => `<option value="${t}">${t}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label for="filter-industry" class="sr-only">Industry</label>
        <select id="filter-industry" class="filter-select">
          ${industries.map(i => `<option value="${i}">${i}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group filter-search">
        <input type="search" id="filter-search" class="filter-input" placeholder="Search jobs…" />
      </div>
      <p class="results-count" id="results-count">${JOBS.length} positions found</p>
    </div>
  `;
}

function renderJobs(jobs) {
  const grid = document.getElementById('jobs-grid');
  if (!grid) return;
  if (!jobs.length) {
    grid.innerHTML = '<p class="loading">No jobs match your search.</p>';
    return;
  }
  grid.innerHTML = jobs.map(createJobCard).join('');
  const count = document.getElementById('results-count');
  if (count) count.textContent = `${jobs.length} position${jobs.length !== 1 ? 's' : ''} found`;
}

function initFilters() {
  const typeSelect = document.getElementById('filter-type');
  const industrySelect = document.getElementById('filter-industry');
  const searchInput = document.getElementById('filter-search');

  const applyFilters = () => {
    const type = typeSelect ? typeSelect.value : 'All';
    const industry = industrySelect ? industrySelect.value : 'All Industries';
    const query = searchInput ? searchInput.value.toLowerCase() : '';

    const filtered = JOBS.filter(job => {
      const matchType = type === 'All' || job.type === type;
      const matchIndustry = industry === 'All Industries' || job.industry === industry;
      const matchSearch = !query || job.title.toLowerCase().includes(query) || job.location.toLowerCase().includes(query);
      return matchType && matchIndustry && matchSearch;
    });
    renderJobs(filtered);
  };

  if (typeSelect) typeSelect.addEventListener('change', applyFilters);
  if (industrySelect) industrySelect.addEventListener('change', applyFilters);
  if (searchInput) searchInput.addEventListener('input', applyFilters);
}

initJobsPage();
