document.addEventListener('DOMContentLoaded', () => {
  function el(tag, text) {
    const e = document.createElement(tag);
    if (text) e.textContent = text;
    return e;
  }

  // Sample jobs
  const jobs = [
    { id: 1, title: 'Warehouse Associate', location: 'London', salary: '£11/hr' },
    { id: 2, title: 'Care Assistant', location: 'Birmingham', salary: '£10.50/hr' },
    { id: 3, title: 'Forklift Operator', location: 'Leeds', salary: '£12/hr' }
  ];

  const jobList = document.getElementById('jobList');
  if (jobList) {
    jobs.forEach((job) => {
      const card = document.createElement('div');
      card.className = 'card';
      const h = el('h3', job.title);
      const p = el('p', `${job.location} • ${job.salary}`);
      card.appendChild(h);
      card.appendChild(p);
      jobList.appendChild(card);
    });
  }

  // Simple form handlers to show results without backend
  const employerForm = document.getElementById('employerForm');
  if (employerForm) {
    employerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const out = document.getElementById('employerResult');
      out && (out.textContent = 'Employer intake submitted (mock)');
    });
  }

  const candidateForm = document.getElementById('candidateForm');
  if (candidateForm) {
    candidateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const out = document.getElementById('candidateResult');
      out && (out.textContent = 'Candidate submitted (mock)');
    });
  }

  // Upload forms (mock)
  const candidateUploadForm = document.getElementById('candidateUploadForm');
  if (candidateUploadForm) {
    candidateUploadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const out = document.getElementById('candidateUploadResult');
      out && (out.textContent = 'File upload mocked locally');
    });
  }
});

// Keep the file small and dependency-free so it serves quickly during dev
