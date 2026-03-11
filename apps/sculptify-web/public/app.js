/* Sculptify Web App */

const API_BASE = '/api';

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.message || `HTTP ${res.status}`), { status: res.status });
  return data;
}

// Load live stats from API
async function loadStats() {
  try {
    const [bookingsData, onboardingData] = await Promise.all([
      fetchJSON(`${API_BASE}/sculptify/bookings`).catch(() => ({ bookings: [] })),
      fetchJSON(`${API_BASE}/sculptify/onboarding`).catch(() => ({ onboarding: [] }))
    ]);
    document.querySelector('#stat-appointments .stat-number').textContent = bookingsData.bookings.length;
    document.querySelector('#stat-training .stat-number').textContent = onboardingData.onboarding.length;
  } catch (e) {
    // silently ignore
  }
}

// Load providers from API
async function loadProviders() {
  const grid = document.getElementById('providers-grid');
  if (!grid) return;
  try {
    const data = await fetchJSON(`${API_BASE}/sculptify/providers`);
    if (!data.providers || !data.providers.length) {
      grid.innerHTML = '<p class="loading">No providers listed yet.</p>';
      return;
    }
    grid.innerHTML = data.providers.map(p => `
      <div class="card">
        <div class="card-icon">🌿</div>
        <h3>${p.name}</h3>
        <p>${p.specialty || ''}</p>
        <p><em>${p.mode || ''}</em></p>
        <a href="#contact" class="btn btn-outline">Book Session</a>
      </div>
    `).join('');
  } catch (e) {
    grid.innerHTML = '<p class="loading">Could not load providers.</p>';
  }
}

// Load training courses
async function loadCourses() {
  const grid = document.getElementById('courses-grid');
  try {
    const data = await fetchJSON(`${API_BASE}/training/courses`);
    const sculptifyCourses = data.filter(c => c.app === 'sculptify' || c.app === 'general');
    if (!sculptifyCourses.length) {
      grid.innerHTML = '<p class="loading">No courses available yet.</p>';
      return;
    }
    grid.innerHTML = sculptifyCourses.map(c => `
      <div class="card">
        <div class="card-icon">📚</div>
        <h3>${c.title}</h3>
        <p>Duration: ${c.duration}</p>
        <button class="btn btn-outline" onclick="enrollCourse('${c.id}')">Enroll Free</button>
      </div>
    `).join('');
  } catch (e) {
    grid.innerHTML = '<p class="loading">Could not load courses.</p>';
  }
}

async function enrollCourse(courseId) {
  try {
    const userId = 'guest-' + Math.random().toString(36).slice(2, 8);
    const result = await fetchJSON(`${API_BASE}/training/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, courseId })
    });
    if (result.success) {
      alert('Enrolled successfully! Check your progress in your dashboard.');
    }
  } catch (e) {
    alert('Could not enroll right now. Please try again.');
  }
}

// AI Coach chat
function appendMessage(type, text) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = `chat-msg ${type}`;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

async function sendCoachMessage() {
  const input = document.getElementById('coach-input');
  const message = input.value.trim();
  if (!message) return;
  input.value = '';
  appendMessage('user', message);

  try {
    const data = await fetchJSON(`${API_BASE}/ai/coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context: 'sculptify' })
    });
    appendMessage('coach', data.reply);
  } catch (e) {
    appendMessage('coach', 'Sorry, I am unable to respond right now. Try again shortly.');
  }
}

document.getElementById('coach-send').addEventListener('click', sendCoachMessage);
document.getElementById('coach-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') sendCoachMessage();
});

// Booking form - wired to live API
document.getElementById('booking-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = document.getElementById('booking-status');
  status.style.color = '';
  status.textContent = 'Submitting...';

  const payload = {
    fullName: document.getElementById('book-name').value.trim(),
    email: document.getElementById('book-email').value.trim(),
    service: document.getElementById('book-service').value,
    sessionType: document.getElementById('book-session-type').value,
    date: document.getElementById('book-date').value
  };

  try {
    await fetchJSON(`${API_BASE}/sculptify/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    status.textContent = 'Your appointment request has been received! We will be in touch shortly.';
    e.target.reset();
    loadStats();
  } catch (err) {
    status.style.color = '#f87171';
    status.textContent = err.message || 'Could not submit request. Please try again.';
  }
});

// Therapist onboarding form - wired to live API
const onboardingForm = document.getElementById('onboarding-form');
if (onboardingForm) {
  onboardingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('onboarding-status');
    status.style.color = '';
    status.textContent = 'Submitting...';

    const payload = {
      fullName: document.getElementById('onboard-name').value.trim(),
      email: document.getElementById('onboard-email').value.trim(),
      phone: document.getElementById('onboard-phone').value.trim(),
      serviceSpecialty: document.getElementById('onboard-specialty').value.trim(),
      licenseNumber: document.getElementById('onboard-license').value.trim(),
      insuranceProvider: document.getElementById('onboard-insurance').value.trim()
    };

    try {
      await fetchJSON(`${API_BASE}/sculptify/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      status.textContent = 'Thank you! Your provider application has been submitted. We will review and contact you soon.';
      e.target.reset();
    } catch (err) {
      status.style.color = '#f87171';
      status.textContent = err.message || 'Could not submit application. Please try again.';
    }
  });
}

// Init
loadStats();
loadProviders();
loadCourses();
appendMessage('coach', 'Welcome to Sculptify! Ask me anything about your wellness journey.');
