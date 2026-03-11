/* Sculptify – Training Courses Component */

const API_BASE = '/api';

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
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
  } catch {
    alert('Could not enroll right now. Please try again.');
  }
}

/**
 * Fetch training courses and render them into #courses-grid.
 * Uses event delegation on the grid so no global functions are needed.
 */
export async function loadCourses() {
  const grid = document.getElementById('courses-grid');
  if (!grid) return;

  // Event delegation: handle enroll button clicks on the grid container
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-enroll-id]');
    if (btn) enrollCourse(btn.dataset.enrollId);
  });

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
        <button class="btn btn-outline" data-enroll-id="${c.id}">Enroll Free</button>
      </div>
    `).join('');
  } catch {
    grid.innerHTML = '<p class="loading">Could not load courses.</p>';
  }
}
