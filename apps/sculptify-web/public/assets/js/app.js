const bookingForm = document.getElementById('bookingForm');
const bookingResult = document.getElementById('bookingResult');
const therapistForm = document.getElementById('therapistForm');
const therapistResult = document.getElementById('therapistResult');
const therapistUploadForm = document.getElementById('therapistUploadForm');
const therapistUploadResult = document.getElementById('therapistUploadResult');
const sculptifyStats = document.getElementById('sculptifyStats');
const providerList = document.getElementById('providerList');

async function getJson(url, options = {}) {
  const response = await fetch(url, options);
  const json = await response.json();
  if (!response.ok || !json.ok) {
    throw new Error(json.message || 'Request failed');
  }
  return json;
}

async function loadProviders() {
  if (!providerList) return;
  providerList.innerHTML = 'Loading providers...';

  try {
    const json = await getJson('/api/sculptify/providers');
    if (!json.providers.length) {
      providerList.innerHTML = '<div class="card"><p>No providers yet.</p></div>';
      return;
    }

    providerList.innerHTML = json.providers.map((item) => `
      <div class="provider">
        <h3>${item.name || ''}</h3>
        <p>${item.specialty || ''}</p>
        <span>${item.mode || ''}</span>
      </div>
    `).join('');
  } catch (error) {
    providerList.innerHTML = '<div class="card"><p>Could not load providers.</p></div>';
  }
}

async function loadDashboard() {
  if (!sculptifyStats) return;
  sculptifyStats.innerHTML = 'Loading dashboard...';

  try {
    const json = await getJson('/api/sculptify-admin/dashboard');
    sculptifyStats.innerHTML = `
      <div class="card"><h3>Providers</h3><p>${json.metrics.providers}</p></div>
      <div class="card"><h3>Bookings</h3><p>${json.metrics.bookings}</p></div>
      <div class="card"><h3>Onboarding</h3><p>${json.metrics.onboarding}</p></div>
    `;
  } catch (error) {
    sculptifyStats.innerHTML = '<div class="card"><p>Could not load dashboard.</p></div>';
  }
}

if (bookingForm) {
  bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(bookingForm).entries());
    bookingResult.textContent = 'Submitting...';

    try {
      const json = await getJson('/api/sculptify/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      bookingResult.textContent = json.message;
      bookingForm.reset();
      loadDashboard();
    } catch (error) {
      bookingResult.textContent = error.message;
    }
  });
}

if (therapistForm) {
  therapistForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(therapistForm).entries());
    therapistResult.textContent = 'Submitting...';

    try {
      const json = await getJson('/api/sculptify/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      therapistResult.textContent = json.message;
      therapistForm.reset();
      loadDashboard();
    } catch (error) {
      therapistResult.textContent = error.message;
    }
  });
}

if (therapistUploadForm) {
  therapistUploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    therapistUploadResult.textContent = 'Uploading...';

    try {
      const formData = new FormData(therapistUploadForm);
      const response = await fetch('/api/uploads/therapist-document', {
        method: 'POST',
        body: formData
      });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.message || 'Upload failed');
      therapistUploadResult.textContent = json.message;
      therapistUploadForm.reset();
    } catch (error) {
      therapistUploadResult.textContent = error.message;
    }
  });
}

loadProviders();
loadDashboard();
