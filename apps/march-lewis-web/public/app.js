/* March & Lewis Web App – main entry point
 * Imports page, component, and form modules from /march-lewis/src/
 */

import { loadStats }              from './src/components/statsBar.js';
import { initCoachChat }          from './src/components/coachChat.js';
import { loadJobs }               from './src/pages/jobs.js';
import { initCandidateOnboarding } from './src/pages/candidates.js';
import { initEmployerIntake }     from './src/pages/employers.js';
import { initAdminLogin }         from './src/pages/admin.js';

const API_BASE = '/api';

// Load training courses
async function loadCourses() {
  const grid = document.getElementById('courses-grid');
  try {
    const res = await fetch(`${API_BASE}/training/courses`);
    const data = await res.json();
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
        <button class="btn btn-outline" data-course-id="${c.id}">Enroll Free</button>
      </div>
    `).join('');
    grid.addEventListener('click', e => {
      const btn = e.target.closest('[data-course-id]');
      if (btn) enrollCourse(btn.dataset.courseId);
    }, { once: true });
  } catch {
    grid.innerHTML = '<p class="loading">Could not load courses.</p>';
  }
}

async function enrollCourse(courseId) {
  try {
    const userId = 'guest-' + Math.random().toString(36).slice(2, 8);
    const res = await fetch(`${API_BASE}/training/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, courseId })
    });
    const result = await res.json();
    if (result.success) {
      alert('Enrolled successfully! Check your dashboard for progress.');
    }
  } catch {
    alert('Could not enroll right now. Please try again.');
  }
}

// Init
loadStats(API_BASE);
loadJobs(API_BASE);
loadCourses();
initCoachChat(API_BASE);
initCandidateOnboarding(API_BASE);
initEmployerIntake(API_BASE);
initAdminLogin(API_BASE);

