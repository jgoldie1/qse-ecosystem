/* March & Lewis — Home Page */

import { initHeader } from '../components/header.js';
import { initFooter } from '../components/footer.js';
import { renderStats, loadStats } from '../components/stats.js';
import { createCourseCard } from '../components/card.js';
import { renderApplyForm, initApplyForm } from '../forms/apply-form.js';
import { getTrainingCourses, enrollCourse, sendCoachMessage } from '../api.js';

export function initHomePage() {
  initHeader();
  initFooter();

  // Inject stats
  const statsPlaceholder = document.getElementById('stats-placeholder');
  if (statsPlaceholder) {
    statsPlaceholder.outerHTML = renderStats();
    loadStats('stats-placeholder').catch(() => {});
  }

  // Load training courses
  loadCourses();

  // Apply form
  const applyPlaceholder = document.getElementById('apply-form-placeholder');
  if (applyPlaceholder) {
    applyPlaceholder.outerHTML = renderApplyForm();
    initApplyForm();
  }

  // AI Coach
  initCoach();
}

async function loadCourses() {
  const grid = document.getElementById('courses-grid');
  if (!grid) return;

  try {
    const courses = await getTrainingCourses();
    const filtered = courses.filter(c => c.app === 'marchLewis' || c.app === 'general');
    if (!filtered.length) {
      grid.innerHTML = '<p class="loading">No courses available yet.</p>';
      return;
    }
    grid.innerHTML = filtered.map(createCourseCard).join('');

    grid.addEventListener('click', async (e) => {
      const btn = e.target.closest('.enroll-btn');
      if (!btn) return;
      const courseId = btn.dataset.courseId;
      btn.disabled = true;
      btn.textContent = 'Enrolling…';
      try {
        const userId = `guest-${Math.random().toString(36).slice(2, 8)}`;
        const result = await enrollCourse(userId, courseId);
        if (result.success) {
          btn.textContent = '✓ Enrolled';
        }
      } catch (_) {
        btn.textContent = 'Try Again';
        btn.disabled = false;
      }
    });
  } catch (_) {
    grid.innerHTML = '<p class="loading">Could not load courses.</p>';
  }
}

function initCoach() {
  const sendBtn = document.getElementById('coach-send');
  const input = document.getElementById('coach-input');
  if (!sendBtn || !input) return;

  // Welcome message
  appendMessage('coach', 'Welcome to March & Lewis! Ask me anything about your career journey.');

  const handleSend = async () => {
    const message = input.value.trim();
    if (!message) return;
    input.value = '';
    appendMessage('user', message);

    try {
      const data = await sendCoachMessage(message);
      appendMessage('coach', data.reply);
    } catch (_) {
      appendMessage('coach', 'Sorry, I am unable to respond right now. Try again shortly.');
    }
  };

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });
}

function appendMessage(type, text) {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = `chat-msg ${type}`;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

initHomePage();
