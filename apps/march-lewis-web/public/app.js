/* March & Lewis Web App */

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
    const [candidatesData, employersData] = await Promise.all([
      fetchJSON(`${API_BASE}/march-lewis/candidates`).catch(() => ({ candidates: [] })),
      fetchJSON(`${API_BASE}/march-lewis/employers`).catch(() => ({ employers: [] }))
    ]);
    document.querySelector('#stat-applications .stat-number').textContent = candidatesData.candidates.length;
    document.querySelector('#stat-employers .stat-number').textContent = employersData.employers.length;
  } catch (e) {
    // silently ignore
  }
}

// Load jobs from API
async function loadJobs() {
  const grid = document.getElementById('jobs-grid');
  if (!grid) return;
  try {
    const data = await fetchJSON(`${API_BASE}/march-lewis/jobs`);
    if (!data.jobs || !data.jobs.length) {
      grid.innerHTML = '<p class="loading">No open positions at this time.</p>';
      return;
    }
    grid.innerHTML = data.jobs.map(j => `
      <div class="card">
        <div class="card-icon">💼</div>
        <h3>${j.title}</h3>
        <p>${j.type || ''} &mdash; ${j.location || ''}</p>
        <a href="#apply" class="btn btn-outline">Apply Now</a>
      </div>
    `).join('');
  } catch (e) {
    grid.innerHTML = '<p class="loading">Could not load positions.</p>';
  }
}

// Load training courses
async function loadCourses() {
  const grid = document.getElementById('courses-grid');
  try {
    const data = await fetchJSON(`${API_BASE}/training/courses`);
    const mlCourses = data.filter(c => c.app === 'marchLewis' || c.app === 'general');
    if (!mlCourses.length) {
      grid.innerHTML = '<p class="loading">No courses available yet.</p>';
      return;
    }
    grid.innerHTML = mlCourses.map(c => `
      <div class="card">
        <div class="card-icon">🎓</div>
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
      alert('Enrolled successfully! Check your dashboard for progress.');
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
      body: JSON.stringify({ message, context: 'marchLewis' })
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

// Candidate application form - wired to live API
document.getElementById('apply-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = document.getElementById('apply-status');
  status.style.color = '';
  status.textContent = 'Submitting...';

  const payload = {
    fullName: document.getElementById('apply-name').value.trim(),
    email: document.getElementById('apply-email').value.trim(),
    phone: document.getElementById('apply-phone').value.trim(),
    workAuthorization: document.getElementById('apply-authorization').value,
    availability: document.getElementById('apply-availability').value
  };

  try {
    await fetchJSON(`${API_BASE}/march-lewis/candidates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    status.textContent = 'Your application has been received! Our team will be in touch within 2 business days.';
    e.target.reset();
    loadStats();
  } catch (err) {
    status.style.color = '#f87171';
    status.textContent = err.message || 'Could not submit application. Please try again.';
  }
});

// Employer intake form - wired to live API
const employerForm = document.getElementById('employer-form');
if (employerForm) {
  employerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('employer-status');
    status.style.color = '';
    status.textContent = 'Submitting...';

    const payload = {
      companyName: document.getElementById('employer-company').value.trim(),
      hiringManager: document.getElementById('employer-manager').value.trim(),
      email: document.getElementById('employer-email').value.trim(),
      positionType: document.getElementById('employer-position-type').value
    };

    try {
      await fetchJSON(`${API_BASE}/march-lewis/employers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      status.textContent = 'Your talent request has been received! A recruiter will contact you shortly.';
      e.target.reset();
      loadStats();
    } catch (err) {
      status.style.color = '#f87171';
      status.textContent = err.message || 'Could not submit request. Please try again.';
    }
  });
}

// Init
loadStats();
loadJobs();
loadCourses();
appendMessage('coach', 'Welcome to March & Lewis! Ask me anything about your career journey.');
