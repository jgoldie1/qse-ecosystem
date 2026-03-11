/* Sculptify Web App */

const API_BASE = '/api';

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Load analytics stats
async function loadStats() {
  try {
    const data = await fetchJSON(`${API_BASE}/health`);
    if (data.status !== 'ok') return;
    const analytics = await fetchJSON('/data/analytics.json').catch(() => null);
    if (analytics && analytics.sculptify) {
      document.querySelector('#stat-appointments .stat-number').textContent = analytics.sculptify.appointments;
      document.querySelector('#stat-sales .stat-number').textContent = analytics.sculptify.sales;
      document.querySelector('#stat-training .stat-number').textContent = analytics.sculptify.trainingEnrollments;
    }
  } catch (e) {
    // silently ignore
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

// Load providers with inline editing
async function loadProviders() {
  const grid = document.getElementById('providers-grid');
  if (!grid) return;
  try {
    const providers = await fetchJSON(`${API_BASE}/sculptify/providers`);
    if (!providers.length) {
      grid.innerHTML = '<p class="loading">No providers available yet.</p>';
      return;
    }
    grid.innerHTML = providers.map(p => `
      <div class="card provider-card" data-id="${p.id}">
        <div class="card-icon">🌿</div>
        <h3 class="provider-name" contenteditable="true" data-field="name">${p.name || ''}</h3>
        <p class="provider-specialty" contenteditable="true" data-field="specialty">${p.specialty || ''}</p>
        <p class="provider-mode" contenteditable="true" data-field="mode">${p.mode || ''}</p>
        <p class="provider-bio" contenteditable="true" data-field="bio">${p.bio || ''}</p>
        <button class="btn btn-outline save-provider" onclick="saveProvider(${p.id})">Save</button>
        <span class="save-status" id="save-status-${p.id}"></span>
      </div>
    `).join('');
  } catch (e) {
    grid.innerHTML = '<p class="loading">Could not load providers.</p>';
  }
}

async function saveProvider(id) {
  const card = document.querySelector(`.provider-card[data-id="${id}"]`);
  const statusEl = document.getElementById(`save-status-${id}`);
  if (!card) return;

  const data = {
    name: card.querySelector('[data-field="name"]').textContent.trim(),
    specialty: card.querySelector('[data-field="specialty"]').textContent.trim(),
    mode: card.querySelector('[data-field="mode"]').textContent.trim(),
    bio: card.querySelector('[data-field="bio"]').textContent.trim(),
    status: 'active'
  };

  try {
    await fetchJSON(`${API_BASE}/sculptify/providers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (statusEl) {
      statusEl.textContent = 'Saved!';
      statusEl.style.color = '#4ade80';
      setTimeout(() => { statusEl.textContent = ''; }, 2000);
    }
  } catch (e) {
    if (statusEl) {
      statusEl.textContent = 'Save failed.';
      statusEl.style.color = '#f87171';
    }
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

// Booking form
document.getElementById('booking-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = document.getElementById('booking-status');
  const name = document.getElementById('book-name').value;
  const email = document.getElementById('book-email').value;
  const service = document.getElementById('book-service').value;

  try {
    await fetchJSON(`${API_BASE}/sculptify/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: name, email, service, sessionType: 'in-person', date: '' })
    });
    status.textContent = 'Your appointment request has been received! We will be in touch shortly.';
    e.target.reset();
  } catch (err) {
    status.style.color = '#f87171';
    status.textContent = 'Could not submit request. Please try again.';
  }
});

// Init
loadStats();
loadCourses();
loadProviders();
appendMessage('coach', 'Welcome to Sculptify! Ask me anything about your wellness journey.');

