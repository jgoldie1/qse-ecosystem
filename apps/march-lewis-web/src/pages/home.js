/* March & Lewis — Home page module */

import { mountHeader } from '../components/header.js';
import { mountFooter } from '../components/footer.js';
import { showToast }   from '../components/toast.js';
import { fetchJSON, API_BASE } from '../api/client.js';
import { initApplicationForm } from '../forms/applicationForm.js';

mountHeader('home');
mountFooter();
initApplicationForm();

/* ── Platform stats ── */
(async () => {
  try {
    await fetchJSON(`${API_BASE}/health`);
    const analytics = await fetchJSON('/data/analytics.json').catch(() => null);
    const ml = analytics?.marchLewis;
    if (ml) {
      document.querySelector('#stat-applications .stat-number').textContent =
        ml.jobApplications.toLocaleString();
      document.querySelector('#stat-employers .stat-number').textContent =
        ml.employerRequests.toLocaleString();
      document.querySelector('#stat-training .stat-number').textContent =
        ml.trainingEnrollments.toLocaleString();
    }
  } catch { /* silently ignore */ }
})();

/* ── Training courses ── */
(async () => {
  const grid = document.getElementById('courses-grid');
  if (!grid) return;
  try {
    const data = await fetchJSON(`${API_BASE}/training/courses`);
    const courses = data.filter((c) => c.app === 'marchLewis' || c.app === 'general');
    if (!courses.length) {
      grid.innerHTML = '<p class="loading">No courses available yet.</p>';
      return;
    }
    grid.innerHTML = courses
      .map(
        (c) => `
      <div class="card">
        <div class="card-icon">&#127891;</div>
        <h3>${c.title}</h3>
        <p>Duration: ${c.duration}</p>
        <button class="btn btn-outline" data-course="${c.id}">Enroll Free</button>
      </div>`
      )
      .join('');

    grid.querySelectorAll('[data-course]').forEach((btn) =>
      btn.addEventListener('click', async () => {
        try {
          const r = await fetchJSON(`${API_BASE}/training/enroll`, {
            method: 'POST',
            body: JSON.stringify({
              userId: 'guest-' + Math.random().toString(36).slice(2, 8),
              courseId: btn.dataset.course,
            }),
          });
          if (r.success) showToast('Enrolled! Check your profile for progress.', 'success');
        } catch {
          showToast('Could not enroll right now. Please try again.', 'error');
        }
      })
    );
  } catch {
    grid.innerHTML = '<p class="loading">Could not load courses.</p>';
  }
})();

/* ── AI Career Coach ── */
function appendMsg(type, text) {
  const c = document.getElementById('chat-messages');
  if (!c) return;
  const d = document.createElement('div');
  d.className = `chat-msg ${type}`;
  d.textContent = text;
  c.appendChild(d);
  c.scrollTop = c.scrollHeight;
}

async function sendMsg() {
  const input = document.getElementById('coach-input');
  const msg = input?.value.trim();
  if (!msg) return;
  input.value = '';
  appendMsg('user', msg);
  try {
    const r = await fetchJSON(`${API_BASE}/ai/coach`, {
      method: 'POST',
      body: JSON.stringify({ message: msg, context: 'marchLewis' }),
    });
    appendMsg('coach', r.reply);
  } catch {
    appendMsg('coach', 'Sorry, I am unable to respond right now. Try again shortly.');
  }
}

document.getElementById('coach-send')?.addEventListener('click', sendMsg);
document.getElementById('coach-input')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMsg();
});

appendMsg('coach', 'Welcome to March & Lewis! Ask me anything about your career journey.');
