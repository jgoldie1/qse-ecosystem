(function () {
  const mount = document.getElementById('sourceApp');
  if (!mount) return;

  mount.innerHTML = `
    <section class="panel">
      <h2>Source Driven March &amp; Lewis App</h2>
      <p>Touch-friendly inline editing is enabled for job listings.</p>
    </section>

    <section class="grid two">
      <div class="panel">
        <h2>Employer Intake</h2>
        <form id="srcEmployerForm" class="form">
          <input name="companyName" placeholder="Company name" />
          <input name="hiringManager" placeholder="Hiring manager" />
          <input name="email" type="email" placeholder="Business email" />
          <select name="positionType">
            <option value="">Open position type</option>
            <option>Full-Time</option>
            <option>Part-Time</option>
            <option>Contract</option>
            <option>Temporary</option>
          </select>
          <button type="submit" class="btn primary">Submit Intake</button>
        </form>
        <div id="srcEmployerResult" class="result"></div>
      </div>

      <div class="panel">
        <h2>Candidate Onboarding</h2>
        <form id="srcCandidateForm" class="form">
          <input name="fullName" placeholder="Full name" />
          <input name="email" type="email" placeholder="Email" />
          <input name="phone" placeholder="Phone" />
          <input name="workAuthorization" placeholder="Work authorization" />
          <input name="availability" placeholder="Availability" />
          <button type="submit" class="btn primary">Submit Candidate</button>
        </form>
        <div id="srcCandidateResult" class="result"></div>
      </div>
    </section>

    <section class="panel">
      <h2>Jobs + Interview Status</h2>
      <div id="srcJobList" class="cards"></div>
    </section>
  `;

  const employerForm = document.getElementById('srcEmployerForm');
  const employerResult = document.getElementById('srcEmployerResult');
  const candidateForm = document.getElementById('srcCandidateForm');
  const candidateResult = document.getElementById('srcCandidateResult');
  const jobList = document.getElementById('srcJobList');

  async function fetchJson(url, options) {
    const response = await fetch(url, options || {});
    const json = await response.json();
    if (!response.ok || !json.ok) throw new Error(json.message || 'Request failed');
    return json;
  }

  async function loadJobs() {
    jobList.innerHTML = 'Loading jobs...';

    try {
      const [jobsJson, interviewsJson] = await Promise.all([
        fetchJson('/api/march-lewis/jobs'),
        fetchJson('/api/scheduling/march-lewis-interviews')
      ]);

      const jobs = jobsJson.jobs || [];
      const interviews = interviewsJson.interviews || [];

      jobList.innerHTML = jobs.map((job) => `
        <div class="card" data-job-id="${job.id}">
          ${job.image_url ? `<img src="${job.image_url}" alt="${job.title}" style="width:100%;max-height:220px;object-fit:cover;border-radius:12px;margin-bottom:12px;" />` : ''}
          <div class="job-view">
            <h3>${job.title || ''}</h3>
            <p>${job.type || ''}</p>
            <span>${job.location || ''}</span>
            <p>${job.description || ''}</p>
            <p>Status: ${job.status || ''}</p>
            <p>${interviews.length ? `Interviews scheduled: ${interviews.length}` : 'No interviews scheduled yet'}</p>
            <button class="btn secondary job-edit-btn" type="button">Edit</button>
          </div>
          <form class="form job-edit-form" style="display:none;">
            <input name="title" value="${job.title || ''}" placeholder="Title" />
            <input name="type" value="${job.type || ''}" placeholder="Type" />
            <input name="location" value="${job.location || ''}" placeholder="Location" />
            <input name="status" value="${job.status || 'open'}" placeholder="Status" />
            <input name="imageUrl" value="${job.image_url || ''}" placeholder="Image URL" />
            <input name="description" value="${job.description || ''}" placeholder="Description" />
            <div class="row">
              <button class="btn primary job-save-btn" type="submit">Save</button>
              <button class="btn secondary job-cancel-btn" type="button">Cancel</button>
            </div>
            <div class="result job-edit-result"></div>
          </form>
        </div>
      `).join('') || '<div class="card"><p>No jobs found.</p></div>';

      wireJobEditors();
    } catch (error) {
      jobList.innerHTML = `<div class="card"><p>${error.message}</p></div>`;
    }
  }

  function wireJobEditors() {
    jobList.querySelectorAll('.card[data-job-id]').forEach((card) => {
      const editBtn = card.querySelector('.job-edit-btn');
      const cancelBtn = card.querySelector('.job-cancel-btn');
      const view = card.querySelector('.job-view');
      const form = card.querySelector('.job-edit-form');
      const result = card.querySelector('.job-edit-result');
      const id = card.getAttribute('data-job-id');

      if (editBtn) {
        editBtn.addEventListener('click', () => {
          view.style.display = 'none';
          form.style.display = 'grid';
        });
      }

      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          form.style.display = 'none';
          view.style.display = 'block';
        });
      }

      if (form) {
        form.addEventListener('submit', async (event) => {
          event.preventDefault();
          result.textContent = 'Saving...';

          try {
            const data = Object.fromEntries(new FormData(form).entries());
            const json = await fetchJson(`/api/march-lewis/jobs/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            result.textContent = json.message;
            await loadJobs();
          } catch (error) {
            result.textContent = error.message;
          }
        });
      }
    });
  }

  if (employerForm) {
    employerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      employerResult.textContent = 'Submitting...';
      try {
        const data = Object.fromEntries(new FormData(employerForm).entries());
        const json = await fetchJson('/api/march-lewis/employers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        employerResult.textContent = json.message;
        employerForm.reset();
      } catch (error) {
        employerResult.textContent = error.message;
      }
    });
  }

  if (candidateForm) {
    candidateForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      candidateResult.textContent = 'Submitting...';
      try {
        const data = Object.fromEntries(new FormData(candidateForm).entries());
        const json = await fetchJson('/api/march-lewis/candidates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        candidateResult.textContent = json.message;
        candidateForm.reset();
      } catch (error) {
        candidateResult.textContent = error.message;
      }
    });
  }

  loadJobs();
})();
