/* March & Lewis — Home Page Module */
import { api } from '../api/client.js';
import { renderHeader } from '../components/header.js';
import { renderFooter } from '../components/footer.js';

const JOBS = [
  { icon: '👔', title: 'Administrative Assistant', detail: 'Full-time — Dallas, TX' },
  { icon: '💻', title: 'IT Support Specialist', detail: 'Full-time — Remote' },
  { icon: '🏥', title: 'Healthcare Coordinator', detail: 'Part-time — Houston, TX' },
  { icon: '📊', title: 'Workforce Analyst', detail: 'Full-time — Austin, TX' },
  { icon: '🤝', title: 'Client Relations Manager', detail: 'Full-time — Dallas, TX' },
  { icon: '🔧', title: 'Operations Coordinator', detail: 'Contract — Remote' },
];

async function loadStats() {
  try {
    await api.getHealth();
    const analytics = await fetch('/data/analytics.json').then((r) => r.json()).catch(() => null);
    if (analytics && analytics.marchLewis) {
      document.querySelector('#stat-applications .stat-number').textContent = analytics.marchLewis.jobApplications;
      document.querySelector('#stat-employers .stat-number').textContent = analytics.marchLewis.employerRequests;
      document.querySelector('#stat-training .stat-number').textContent = analytics.marchLewis.trainingEnrollments;
    }
  } catch {}
}

async function loadCourses() {
  const grid = document.getElementById('courses-grid');
  try {
    const courses = await api.getCourses();
    const ml = courses.filter((c) => c.app === 'marchLewis' || c.app === 'general');
    if (!ml.length) { grid.innerHTML = '<p class="loading">No courses available yet.</p>'; return; }
    grid.innerHTML = ml.map((c) => `
      <div class="card">
        <div class="card-icon">🎓</div>
        <h3>${c.title}</h3>
        <p>Duration: ${c.duration}</p>
        <button class="btn btn-outline enroll-btn" data-id="${c.id}" style="width:100%;text-align:center">Enroll Free</button>
      </div>
    `).join('');

    grid.querySelectorAll('.enroll-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = 'Enrolling…';
        try {
          const userId = `guest-${Math.random().toString(36).slice(2, 8)}`;
          await api.enrollCourse(userId, btn.dataset.id);
          btn.textContent = '✓ Enrolled';
          btn.style.color = '#4ade80';
        } catch {
          btn.disabled = false;
          btn.textContent = 'Try Again';
        }
      });
    });
  } catch {
    grid.innerHTML = '<p class="loading">Could not load courses.</p>';
  }
}

function initCoach() {
  const container = document.getElementById('chat-messages');
  const input = document.getElementById('coach-input');
  const sendBtn = document.getElementById('coach-send');

  function appendMsg(type, text) {
    const div = document.createElement('div');
    div.className = `chat-msg ${type}`;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  async function send() {
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    appendMsg('user', msg);
    sendBtn.disabled = true;
    try {
      const data = await api.askCoach(msg);
      appendMsg('coach', data.reply);
    } catch {
      appendMsg('coach', 'Sorry, I am unable to respond right now. Try again shortly.');
    } finally {
      sendBtn.disabled = false;
    }
  }

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
  appendMsg('coach', 'Welcome to March & Lewis! Ask me anything about your career journey.');
}

export function initHomePage() {
  renderHeader();

  document.getElementById('app').innerHTML = `
    <main>
      <section class="hero">
        <div class="container">
          <h1>Your Career, Your Future</h1>
          <p>Connecting top talent with great employers. Start your career journey or find your next hire today.</p>
          <div class="hero-actions">
            <a href="/march-lewis/jobs.html" class="btn btn-primary">Find a Job</a>
            <a href="/march-lewis/employer-intake.html" class="btn btn-outline">Hire Talent</a>
          </div>
        </div>
      </section>

      <section class="stats container">
        <div class="stat-card" id="stat-applications">
          <span class="stat-number">0</span>
          <span class="stat-label">Job Applications</span>
        </div>
        <div class="stat-card" id="stat-employers">
          <span class="stat-number">0</span>
          <span class="stat-label">Employer Requests</span>
        </div>
        <div class="stat-card" id="stat-training">
          <span class="stat-number">0</span>
          <span class="stat-label">Training Enrollments</span>
        </div>
      </section>

      <section id="jobs" class="section container">
        <h2>Open Positions</h2>
        <div class="grid">
          ${JOBS.map((j) => `
            <div class="card">
              <div class="card-icon">${j.icon}</div>
              <h3>${j.title}</h3>
              <p>${j.detail}</p>
              <a href="/march-lewis/jobs.html" class="btn btn-outline" style="width:100%;text-align:center">View &amp; Apply</a>
            </div>
          `).join('')}
        </div>
      </section>

      <section id="employers" class="section section-alt">
        <div class="container">
          <h2>For Employers</h2>
          <p>Access a vetted pool of qualified candidates. Let us handle the staffing so you can focus on your business.</p>
          <div class="grid">
            <div class="card"><div class="card-icon">🔍</div><h3>Talent Search</h3><p>Search and filter pre-screened candidates across roles and industries.</p></div>
            <div class="card"><div class="card-icon">📋</div><h3>Managed Staffing</h3><p>Full-service staffing management from posting to placement.</p></div>
            <div class="card"><div class="card-icon">📈</div><h3>Workforce Analytics</h3><p>Track hiring trends, retention rates, and workforce performance.</p></div>
          </div>
          <div style="text-align:center;margin-top:28px">
            <a href="/march-lewis/employer-intake.html" class="btn btn-primary">Request Talent</a>
          </div>
        </div>
      </section>

      <section id="training" class="section container">
        <h2>Career Training Programs</h2>
        <div class="grid" id="courses-grid">
          <p class="loading">Loading courses…</p>
        </div>
      </section>

      <section id="ai-coach" class="section section-alt">
        <div class="container">
          <h2>AI Career Coach</h2>
          <p>Get personalized career advice and job-search tips from your AI coach.</p>
          <div class="chat-box">
            <div class="chat-messages" id="chat-messages"></div>
            <div class="chat-input">
              <input type="text" id="coach-input" placeholder="Ask about your career…" />
              <button class="btn btn-primary" id="coach-send">Send</button>
            </div>
          </div>
        </div>
      </section>

      <section id="apply" class="section container">
        <h2>Quick Apply</h2>
        <form class="form" id="quick-apply-form">
          <input type="text" id="apply-name" placeholder="Your Full Name" required />
          <input type="email" id="apply-email" placeholder="Your Email" required />
          <input type="text" id="apply-role" placeholder="Position You Are Applying For" />
          <textarea id="apply-message" placeholder="Tell us about yourself…" rows="4"></textarea>
          <button type="submit" class="btn btn-primary" style="width:100%">Submit Application</button>
          <p id="apply-status" class="form-status" aria-live="polite"></p>
        </form>
      </section>

      <section class="section section-alt">
        <div class="container">
          <h2>About March &amp; Lewis</h2>
          <p>March &amp; Lewis is part of the QSE Ecosystem — a family of platforms dedicated to empowering people. We believe every person deserves access to meaningful work and every business deserves the right team.</p>
          <div style="text-align:center">
            <a href="/" class="btn btn-outline">Back to QSE Home</a>
          </div>
        </div>
      </section>
    </main>
  `;

  loadStats();
  loadCourses();
  initCoach();

  document.getElementById('quick-apply-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('apply-status');
    const name = document.getElementById('apply-name').value.trim();
    const role = document.getElementById('apply-role').value.trim();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Submitting…';
    try {
      await api.createTask({
        title: `Job Application: ${role || 'Open Position'}`,
        description: `Application submitted by ${name}`,
        app: 'marchLewis',
        type: 'jobApplication',
        status: 'pending',
      });
      status.style.color = '#4ade80';
      status.textContent = 'Your application has been received! Our team will be in touch within 2 business days.';
      e.target.reset();
    } catch {
      status.style.color = '#f87171';
      status.textContent = 'Could not submit application. Please try again.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Submit Application';
    }
  });

  renderFooter();
}
