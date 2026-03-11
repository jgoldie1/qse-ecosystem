/* March & Lewis Web App */

var API_BASE = '/api';

// Load analytics stats
async function loadStats() {
  try {
    var data = await QSEUtils.fetchJSON(API_BASE + '/health');
    if (data.status !== 'ok') return;
    var analytics = await QSEUtils.fetchJSON('/data/analytics.json').catch(function () { return null; });
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
  var grid = document.getElementById('courses-grid');
  try {
    var data = await QSEUtils.fetchJSON(API_BASE + '/training/courses');
    var mlCourses = QSEUtils.filterCoursesByApp(data, 'marchLewis');
    if (!mlCourses.length) {
      grid.innerHTML = QSEComponents.renderEmptyCourses();
      return;
    }
    grid.innerHTML = mlCourses.map(function (c) {
      return QSEComponents.renderCourseCard(c, '🎓');
    }).join('');
  } catch (e) {
    grid.innerHTML = QSEComponents.renderEmptyCourses('Could not load courses.');
  }
}

async function enrollCourse(courseId) {
  try {
    var userId = QSEUtils.generateGuestId();
    var result = await QSEUtils.fetchJSON(API_BASE + '/training/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId, courseId: courseId })
    });
    if (result.success) {
      alert('Enrolled successfully! Check your dashboard for progress.');
    }
  } catch (e) {
    alert('Could not enroll right now. Please try again.');
  }
}

// Delegate enroll-button clicks within the courses grid
document.getElementById('courses-grid').addEventListener('click', function (e) {
  var btn = e.target.closest('[data-course-id]');
  if (btn) enrollCourse(btn.getAttribute('data-course-id'));
});

// AI Coach chat
async function sendCoachMessage() {
  var input = document.getElementById('coach-input');
  var message = input.value.trim();
  if (!message) return;
  input.value = '';
  QSEComponents.appendMessage('chat-messages', 'user', message);

  try {
    var data = await QSEUtils.fetchJSON(API_BASE + '/ai/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message, context: 'marchLewis' })
    });
    QSEComponents.appendMessage('chat-messages', 'coach', data.reply);
  } catch (e) {
    QSEComponents.appendMessage('chat-messages', 'coach', 'Sorry, I am unable to respond right now. Try again shortly.');
  }
}

document.getElementById('coach-send').addEventListener('click', sendCoachMessage);
document.getElementById('coach-input').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') sendCoachMessage();
});

// Application form
document.getElementById('apply-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  var status = document.getElementById('apply-status');
  var name = document.getElementById('apply-name').value;
  var role = document.getElementById('apply-role').value;

  try {
    await QSEUtils.fetchJSON(API_BASE + '/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Job Application: ' + (role || 'Open Position'),
        description: 'Application submitted by ' + name,
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
QSEComponents.appendMessage('chat-messages', 'coach', 'Welcome to March & Lewis! Ask me anything about your career journey.');
