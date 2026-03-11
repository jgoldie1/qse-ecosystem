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
  if (!response.ok || !json.ok) throw new Error(json.message || json.error || 'Request failed');
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
  } catch {
    providerList.innerHTML = '<div class="card"><p>Could not load providers.</p></div>';
  }
}

async function loadDashboard() {
  if (!sculptifyStats) return;
  sculptifyStats.innerHTML = '<div class="card"><p>Login token required for admin metrics.</p></div>';
}

if (bookingForm) {
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    bookingResult.className = 'result';
    const formData = Object.fromEntries(new FormData(bookingForm));
    try {
      const json = await getJson('/api/sculptify/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      bookingResult.textContent = json.message || 'Booking submitted!';
      bookingForm.reset();
    } catch (err) {
      bookingResult.className = 'result error';
      bookingResult.textContent = err.message || 'Submission failed.';
    }
  });
}

if (therapistForm) {
  therapistForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    therapistResult.className = 'result';
    const formData = Object.fromEntries(new FormData(therapistForm));
    try {
      const json = await getJson('/api/sculptify/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      therapistResult.textContent = json.message || 'Onboarding submitted!';
      therapistForm.reset();
    } catch (err) {
      therapistResult.className = 'result error';
      therapistResult.textContent = err.message || 'Submission failed.';
    }
  });
}

if (therapistUploadForm) {
  therapistUploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    therapistUploadResult.className = 'result';
    const data = new FormData(therapistUploadForm);
    try {
      const response = await fetch('/api/uploads/therapist-document', { method: 'POST', body: data });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.error || 'Upload failed');
      therapistUploadResult.textContent = json.message || 'Uploaded!';
      therapistUploadForm.reset();
    } catch (err) {
      therapistUploadResult.className = 'result error';
      therapistUploadResult.textContent = err.message || 'Upload failed.';
    }
  });
}

loadProviders();
loadDashboard();
