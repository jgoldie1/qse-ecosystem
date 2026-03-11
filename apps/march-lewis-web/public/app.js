/* March & Lewis Web App */

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
    if (analytics && analytics.marchLewis) {
      document.querySelector('#stat-applications .stat-number').textContent = analytics.marchLewis.jobApplications;
      document.querySelector('#stat-employers .stat-number').textContent = analytics.marchLewis.employerRequests;
      document.querySelector('#stat-training .stat-number').textContent = analytics.marchLewis.trainingEnrollments;
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

// Load scheduled interviews
async function loadInterviews() {
  try {
    const data = await fetchJSON(`${API_BASE}/scheduling/march-lewis-interviews`);
    return data.interviews || [];
  } catch (e) {
    return [];
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

// Application form
document.getElementById('apply-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = document.getElementById('apply-status');
  const name = document.getElementById('apply-name').value;
  const role = document.getElementById('apply-role').value;

  try {
    await fetchJSON(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Job Application: ${role || 'Open Position'}`,
        description: `Application submitted by ${name}`,
        app: 'marchLewis'
      })
    });
    status.textContent = 'Your application has been received! Our team will be in touch within 2 business days.';
    e.target.reset();
  } catch (err) {
    status.style.color = '#f87171';
    status.textContent = 'Could not submit application. Please try again.';
  }
});

// Init
loadStats();
loadCourses();
loadInterviews();
appendMessage('coach', 'Welcome to March & Lewis! Ask me anything about your career journey.');
