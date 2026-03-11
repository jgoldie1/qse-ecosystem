/* March & Lewis — Jobs Page Module */
import { api } from '../api/client.js';
import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';
import { renderApplicationForm } from '../forms/applicationForm.js';

const STATIC_JOBS = [
  { id: 'j1', icon: '👔', title: 'Administrative Assistant', location: 'Dallas, TX', type: 'Full-time', salary: '$38,000–$45,000', tags: ['Admin', 'Office', 'Entry Level'], desc: 'Support day-to-day operations including scheduling, correspondence, and document management for a busy corporate office.' },
  { id: 'j2', icon: '💻', title: 'IT Support Specialist', location: 'Remote', type: 'Full-time', salary: '$55,000–$70,000', tags: ['IT', 'Tech', 'Remote'], desc: 'Provide Level 1/2 technical support for end-users, troubleshoot hardware and software issues, and maintain IT asset inventory.' },
  { id: 'j3', icon: '🏥', title: 'Healthcare Coordinator', location: 'Houston, TX', type: 'Part-time', salary: '$20–$24/hr', tags: ['Healthcare', 'Admin', 'Part-time'], desc: 'Coordinate patient scheduling, liaise between departments, and ensure compliance with healthcare regulations.' },
  { id: 'j4', icon: '📊', title: 'Workforce Analyst', location: 'Austin, TX', type: 'Full-time', salary: '$60,000–$75,000', tags: ['Analytics', 'HR', 'Data'], desc: 'Analyze workforce data, generate reports on hiring trends and retention, and support workforce planning initiatives.' },
  { id: 'j5', icon: '🤝', title: 'Client Relations Manager', location: 'Dallas, TX', type: 'Full-time', salary: '$65,000–$80,000', tags: ['Sales', 'Client', 'Management'], desc: 'Build and maintain strong client relationships, identify growth opportunities, and ensure satisfaction with our staffing services.' },
  { id: 'j6', icon: '🔧', title: 'Operations Coordinator', location: 'Remote', type: 'Contract', salary: '$28–$35/hr', tags: ['Operations', 'Remote', 'Contract'], desc: 'Coordinate daily operational workflows, track project milestones, and communicate with cross-functional teams.' },
  { id: 'j7', icon: '📞', title: 'Customer Service Representative', location: 'Dallas, TX', type: 'Full-time', salary: '$32,000–$40,000', tags: ['Customer Service', 'Entry Level', 'Office'], desc: 'Handle inbound customer inquiries, resolve issues, and deliver exceptional service to our employer and candidate network.' },
  { id: 'j8', icon: '🏦', title: 'Accounting Clerk', location: 'Houston, TX', type: 'Full-time', salary: '$40,000–$50,000', tags: ['Finance', 'Accounting', 'Office'], desc: 'Process invoices, assist with month-end close, reconcile accounts, and support the finance team with daily tasks.' },
  { id: 'j9', icon: '📦', title: 'Logistics Coordinator', location: 'Fort Worth, TX', type: 'Full-time', salary: '$42,000–$52,000', tags: ['Logistics', 'Supply Chain', 'Operations'], desc: 'Manage shipping and receiving, coordinate with carriers, and maintain accurate inventory and documentation.' },
];

function renderJobCard(job) {
  return `
    <div class="card job-card" data-id="${job.id}">
      <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px">
        <div class="card-icon" style="margin:0;font-size:1.8rem">${job.icon}</div>
        <div>
          <h3 style="margin-bottom:4px">${job.title}</h3>
          <span style="font-size:0.82rem;color:var(--text-muted)">📍 ${job.location} &nbsp;•&nbsp; ${job.type}</span>
        </div>
      </div>
      <p style="margin-bottom:12px">${job.desc}</p>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px">
        ${job.tags.map((t) => `<span class="tag">${t}</span>`).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="color:var(--primary);font-weight:600;font-size:0.9rem">${job.salary}</span>
        <button class="btn btn-primary apply-btn" data-title="${job.title}" style="padding:8px 18px;font-size:0.88rem">Apply Now</button>
      </div>
    </div>
  `;
}

export function initJobsPage() {
  renderHeader();

  document.getElementById('app').innerHTML = `
    <main>
      <section class="hero" style="padding:50px 0 40px">
        <div class="container">
          <h1 style="font-size:2.4rem">Find Your Next Role</h1>
          <p>Browse open positions across industries. New opportunities added every week.</p>
        </div>
      </section>

      <section class="section container">
        <div class="jobs-filter">
          <input type="search" id="jobs-search" placeholder="🔍  Search by title, skill, or location…" class="search-input" />
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <select id="jobs-type-filter" class="filter-select">
              <option value="">All Types</option>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Remote</option>
            </select>
            <select id="jobs-location-filter" class="filter-select">
              <option value="">All Locations</option>
              <option>Dallas, TX</option>
              <option>Houston, TX</option>
              <option>Austin, TX</option>
              <option>Fort Worth, TX</option>
              <option>Remote</option>
            </select>
          </div>
        </div>

        <p id="jobs-count" style="color:var(--text-muted);font-size:0.9rem;margin:16px 0">${STATIC_JOBS.length} positions available</p>

        <div class="grid" id="jobs-grid">
          ${STATIC_JOBS.map(renderJobCard).join('')}
        </div>
      </section>

      <!-- Apply modal -->
      <div id="apply-modal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-backdrop"></div>
        <div class="modal-content">
          <button id="modal-close" class="modal-close" aria-label="Close">&times;</button>
          <div id="modal-form-container"></div>
        </div>
      </div>

      <section class="section section-alt">
        <div class="container" style="text-align:center">
          <h2>Don&rsquo;t see a fit?</h2>
          <p>Submit a general application and our recruiters will reach out when the right role opens.</p>
          <a href="#" id="open-general-apply" class="btn btn-primary">Submit General Application</a>
        </div>
      </section>
    </main>
  `;

  renderFooter();

  // Filter logic
  function filterJobs() {
    const search = document.getElementById('jobs-search').value.toLowerCase();
    const typeFilter = document.getElementById('jobs-type-filter').value;
    const locFilter = document.getElementById('jobs-location-filter').value;

    const filtered = STATIC_JOBS.filter((j) => {
      const matchText = !search || j.title.toLowerCase().includes(search) || j.tags.some((t) => t.toLowerCase().includes(search)) || j.location.toLowerCase().includes(search);
      const matchType = !typeFilter || j.type === typeFilter || j.tags.includes(typeFilter);
      const matchLoc = !locFilter || j.location === locFilter;
      return matchText && matchType && matchLoc;
    });

    const grid = document.getElementById('jobs-grid');
    document.getElementById('jobs-count').textContent = `${filtered.length} position${filtered.length !== 1 ? 's' : ''} found`;
    grid.innerHTML = filtered.length
      ? filtered.map(renderJobCard).join('')
      : '<p class="loading" style="grid-column:1/-1">No positions match your filters. Try adjusting your search.</p>';

    attachApplyListeners();
  }

  ['jobs-search', 'jobs-type-filter', 'jobs-location-filter'].forEach((id) =>
    document.getElementById(id).addEventListener('input', filterJobs)
  );

  // Modal logic
  function openModal(jobTitle) {
    const modal = document.getElementById('apply-modal');
    const container = document.getElementById('modal-form-container');
    renderApplicationForm(container);
    if (jobTitle) {
      const roleSelect = document.getElementById('af-role');
      const opt = Array.from(roleSelect.options).find((o) => o.value === jobTitle);
      if (opt) roleSelect.value = jobTitle;
      else {
        const custom = new Option(jobTitle, jobTitle);
        roleSelect.add(custom);
        roleSelect.value = jobTitle;
      }
    }
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    document.getElementById('apply-modal').classList.add('hidden');
    document.body.style.overflow = '';
  }

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.querySelector('.modal-backdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  document.getElementById('open-general-apply').addEventListener('click', (e) => {
    e.preventDefault();
    openModal('');
  });

  function attachApplyListeners() {
    document.querySelectorAll('.apply-btn').forEach((btn) => {
      btn.addEventListener('click', () => openModal(btn.dataset.title));
    });
  }
  attachApplyListeners();
}
