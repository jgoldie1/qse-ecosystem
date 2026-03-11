/* Sculptify Web App */

var API_BASE = '/api';

// Load analytics stats
async function loadStats() {
  try {
    var data = await QSEUtils.fetchJSON(API_BASE + '/health');
    if (data.status !== 'ok') return;
    var analytics = await QSEUtils.fetchJSON('/data/analytics.json').catch(function () { return null; });
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
  var grid = document.getElementById('courses-grid');
  try {
    var data = await QSEUtils.fetchJSON(API_BASE + '/training/courses');
    var sculptifyCourses = QSEUtils.filterCoursesByApp(data, 'sculptify');
    if (!sculptifyCourses.length) {
      grid.innerHTML = QSEComponents.renderEmptyCourses();
      return;
    }
    grid.innerHTML = sculptifyCourses.map(function (c) {
      return QSEComponents.renderCourseCard(c, '📚');
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
      alert('Enrolled successfully! Check your progress in your dashboard.');
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
      body: JSON.stringify({ message: message, context: 'sculptify' })
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

// Booking form
document.getElementById('booking-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  var status = document.getElementById('booking-status');
  var name = document.getElementById('book-name').value;
  var service = document.getElementById('book-service').value;

  try {
    await QSEUtils.fetchJSON(API_BASE + '/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Appointment: ' + service,
        description: 'Booking request from ' + name,
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

// Init
loadStats();
loadCourses();
QSEComponents.appendMessage('chat-messages', 'coach', 'Welcome to Sculptify! Ask me anything about your wellness journey.');
