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
  const service = document.getElementById('book-service').value;

  try {
    await fetchJSON(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Appointment: ${service}`,
        description: `Booking request from ${name}`,
        app: 'sculptify'
      })
    });
    status.textContent = 'Your appointment request has been received! We will be in touch shortly.';
    e.target.reset();
  } catch (err) {
    status.style.color = '#f87171';
    status.textContent = 'Could not submit request. Please try again.';
  }
});

// Load and render media with inline edit support
async function loadMedia() {
  const grid = document.getElementById('media-grid');
  try {
    const items = await fetchJSON(`${API_BASE}/streaming/content?app=sculptify`);
    if (!items.length) {
      grid.innerHTML = '<p class="loading">No media available yet.</p>';
      return;
    }
    renderMediaGrid(grid, items);
  } catch (e) {
    grid.innerHTML = '<p class="loading">Could not load media.</p>';
  }
}

function renderMediaGrid(grid, items) {
  const fragment = document.createDocumentFragment();
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.id = `media-card-${item.id}`;

    const icon = document.createElement('div');
    icon.className = 'card-icon';
    icon.textContent = '🎬';

    // View section
    const view = document.createElement('div');
    view.className = 'media-view';
    view.id = `media-view-${item.id}`;

    const title = document.createElement('h3');
    title.textContent = item.title;

    const meta = document.createElement('p');
    meta.textContent = `Type: ${item.type} \u2014 Duration: ${item.duration} min`;

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-outline';
    editBtn.textContent = 'Edit';
    editBtn.dataset.id = item.id;
    editBtn.addEventListener('click', () => startInlineEdit(item.id));

    view.appendChild(title);
    view.appendChild(meta);
    view.appendChild(editBtn);

    // Edit section
    const editDiv = document.createElement('div');
    editDiv.className = 'media-edit';
    editDiv.id = `media-edit-${item.id}`;
    editDiv.style.display = 'none';

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.id = `edit-title-${item.id}`;
    titleInput.value = item.title;
    titleInput.placeholder = 'Title';

    const typeInput = document.createElement('input');
    typeInput.type = 'text';
    typeInput.id = `edit-type-${item.id}`;
    typeInput.value = item.type;
    typeInput.placeholder = 'Type';

    const durationInput = document.createElement('input');
    durationInput.type = 'number';
    durationInput.id = `edit-duration-${item.id}`;
    durationInput.value = item.duration;
    durationInput.placeholder = 'Duration (min)';
    durationInput.min = '0';

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:8px;margin-top:8px;';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-primary';
    saveBtn.textContent = 'Save';
    saveBtn.dataset.id = item.id;
    saveBtn.addEventListener('click', () => saveInlineEdit(item.id));

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-outline';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.dataset.id = item.id;
    cancelBtn.addEventListener('click', () => cancelInlineEdit(item.id));

    btnRow.appendChild(saveBtn);
    btnRow.appendChild(cancelBtn);

    const statusEl = document.createElement('p');
    statusEl.id = `edit-status-${item.id}`;
    statusEl.className = 'form-status';

    editDiv.appendChild(titleInput);
    editDiv.appendChild(typeInput);
    editDiv.appendChild(durationInput);
    editDiv.appendChild(btnRow);
    editDiv.appendChild(statusEl);

    card.appendChild(icon);
    card.appendChild(view);
    card.appendChild(editDiv);
    fragment.appendChild(card);
  });
  grid.innerHTML = '';
  grid.appendChild(fragment);
}

function startInlineEdit(id, title, type, duration) {
  document.getElementById(`media-view-${id}`).style.display = 'none';
  document.getElementById(`media-edit-${id}`).style.display = 'block';
}

function cancelInlineEdit(id) {
  document.getElementById(`media-edit-${id}`).style.display = 'none';
  document.getElementById(`media-view-${id}`).style.display = 'block';
}

async function saveInlineEdit(id) {
  const title = document.getElementById(`edit-title-${id}`).value.trim();
  const type = document.getElementById(`edit-type-${id}`).value.trim();
  const rawDuration = document.getElementById(`edit-duration-${id}`).value;
  const duration = parseInt(rawDuration, 10);
  const statusEl = document.getElementById(`edit-status-${id}`);

  if (!title) {
    statusEl.style.color = '#f87171';
    statusEl.textContent = 'Title cannot be empty.';
    return;
  }
  if (isNaN(duration) || duration < 0) {
    statusEl.style.color = '#f87171';
    statusEl.textContent = 'Duration must be a non-negative number.';
    return;
  }

  try {
    const updated = await fetchJSON(`${API_BASE}/streaming/content/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, type, duration })
    });
    statusEl.style.color = '#4ade80';
    statusEl.textContent = 'Saved!';
    setTimeout(() => {
      const view = document.getElementById(`media-view-${id}`);
      view.querySelector('h3').textContent = updated.title;
      view.querySelector('p').textContent = `Type: ${updated.type} \u2014 Duration: ${updated.duration} min`;
      cancelInlineEdit(id);
      statusEl.textContent = '';
    }, 800);
  } catch (e) {
    statusEl.style.color = '#f87171';
    statusEl.textContent = 'Could not save changes. Please try again.';
  }
}

// Init
loadStats();
loadCourses();
loadMedia();
appendMessage('coach', 'Welcome to Sculptify! Ask me anything about your wellness journey.');
