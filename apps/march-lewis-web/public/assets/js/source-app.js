(function () {
  const mount = document.getElementById('sourceApp');
  if (!mount) return;

  mount.innerHTML = `
    <section class="panel">
      <h2>Source Driven March &amp; Lewis App</h2>
      <p>This section is rendered from the new source file wiring layer.</p>
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

  async function loadJobs() {
    jobList.innerHTML = 'Loading jobs...';
    try {
      const [jobsJson, interviewsJson] = await Promise.all([
        window.MarchLewisBrowserAPI.getJobs(),
        window.MarchLewisBrowserAPI.getInterviews()
      ]);

      const jobs = jobsJson.jobs || [];
      const interviews = interviewsJson.interviews || [];

      jobList.innerHTML = jobs.map((job) => `
        <div class="card">
          <h3>${job.title || ''}</h3>
          <p>${job.type || ''}</p>
          <span>${job.location || ''}</span>
          <p>${interviews.length ? `Interviews scheduled: ${interviews.length}` : 'No interviews scheduled yet'}</p>
        </div>
      `).join('') || '<div class="card"><p>No jobs found.</p></div>';
    } catch (error) {
      jobList.innerHTML = `<div class="card"><p>${error.message}</p></div>`;
    }
  }

  if (employerForm) {
    employerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      employerResult.textContent = 'Submitting...';
      try {
        const data = Object.fromEntries(new FormData(employerForm).entries());
        const json = await window.MarchLewisBrowserAPI.createEmployer(data);
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
        const json = await window.MarchLewisBrowserAPI.createCandidate(data);
        candidateResult.textContent = json.message;
        candidateForm.reset();
      } catch (error) {
        candidateResult.textContent = error.message;
      }
    });
  }

  loadJobs();
})();
