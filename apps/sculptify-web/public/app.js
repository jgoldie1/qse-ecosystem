/* SculptifyLTD - Powered by Stubbs AI */
const API_BASE = '/api';

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

function esc(value) {
  return String(value || '').replace(/[&<>"']/g, function (c) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c];
  });
}

async function loadProviders() {
  const grid = document.getElementById('providers-grid');
  try {
    const data = await fetchJSON(API_BASE + '/sculptify/providers');
    const providers = data.providers || [];
    if (!providers.length) {
      grid.innerHTML = '<div class="card"><div class="card-icon">🌱</div><h3>Provider network ready</h3><p>No provider profiles are published yet. Use the provider onboarding form below.</p><a class="btn btn-outline" href="#provider-apply">Join Sculptify</a></div>';
      return;
    }
    grid.innerHTML = providers.map(function (p) {
      return '<div class="card"><div class="card-icon">🧑🏾‍⚕️</div><h3>' + esc(p.name) + '</h3><p>' + esc(p.specialty || 'Wellness professional') + '</p><a class="btn btn-outline" href="#contact" data-service="' + esc(p.specialty || '') + '">Request Session</a></div>';
    }).join('');
    wireServiceLinks();
  } catch (e) {
    grid.innerHTML = '<div class="card"><h3>Preview mode</h3><p>Start the local QSE server to load live Sculptify providers.</p></div>';
  }
}

async function loadCourses() {
  const grid = document.getElementById('courses-grid');
  try {
    const data = await fetchJSON(API_BASE + '/training/courses');
    const courses = data.filter(function (c) { return c.app === 'sculptify' || c.app === 'general'; });
    grid.innerHTML = courses.map(function (c) {
      return '<div class="card"><div class="card-icon">🎓</div><h3>' + esc(c.title) + '</h3><p>Duration: ' + esc(c.duration) + '</p><button class="btn btn-outline" onclick="enrollCourse(\'' + esc(c.id) + '\')">Enroll</button></div>';
    }).join('');
  } catch (e) {
    grid.innerHTML = '<div class="card"><h3>Training hub</h3><p>Start the local QSE server to load Sculptify training programs.</p></div>';
  }
}

async function enrollCourse(courseId) {
  try {
    const userId = 'guest-' + Math.random().toString(36).slice(2, 8);
    const result = await fetchJSON(API_BASE + '/training/enroll', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({userId: userId, courseId: courseId})
    });
    alert(result.success ? 'Enrollment saved.' : (result.error || 'Could not enroll.'));
  } catch (e) {
    alert('Training enrollment requires the Sculptify server.');
  }
}
window.enrollCourse = enrollCourse;

function appendMessage(type, text) {
  const box = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'chat-msg ' + type;
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

async function sendCoachMessage() {
  const input = document.getElementById('coach-input');
  const message = input.value.trim();
  if (!message) return;
  input.value = '';
  appendMessage('user', message);
  try {
    const data = await fetchJSON(API_BASE + '/ai/coach', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({message: message, context: 'sculptify-stubbs-ai'})
    });
    appendMessage('coach', data.reply);
  } catch (e) {
    appendMessage('coach', 'Stubbs AI is in preview mode. Start the local QSE server to connect the wellness guide.');
  }
}

document.getElementById('coach-send').addEventListener('click', sendCoachMessage);
document.getElementById('coach-input').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') sendCoachMessage();
});

document.getElementById('booking-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const status = document.getElementById('booking-status');
  status.style.color = '#4ade80';
  status.textContent = 'Sending...';
  const payload = {
    fullName: document.getElementById('book-name').value.trim(),
    email: document.getElementById('book-email').value.trim(),
    service: document.getElementById('book-service').value,
    sessionType: document.getElementById('book-session').value,
    date: document.getElementById('book-date').value
  };
  try {
    const result = await fetchJSON(API_BASE + '/sculptify/bookings', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    status.textContent = result.message || 'Appointment request received.';
    e.target.reset();
  } catch (err) {
    status.style.color = '#f87171';
    status.textContent = 'Preview mode: start the local QSE server to save booking requests.';
  }
});

document.getElementById('provider-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const status = document.getElementById('provider-status');
  status.style.color = '#4ade80';
  status.textContent = 'Sending...';
  const payload = {
    fullName: document.getElementById('provider-name').value.trim(),
    email: document.getElementById('provider-email').value.trim(),
    phone: document.getElementById('provider-phone').value.trim(),
    serviceSpecialty: document.getElementById('provider-specialty').value,
    licenseNumber: document.getElementById('provider-license').value.trim(),
    insuranceProvider: document.getElementById('provider-insurance').value.trim()
  };
  try {
    const result = await fetchJSON(API_BASE + '/sculptify/onboarding', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    status.textContent = result.message || 'Provider profile received.';
    e.target.reset();
  } catch (err) {
    status.style.color = '#f87171';
    status.textContent = 'Preview mode: start the local QSE server to save provider applications.';
  }
});

function wireServiceLinks() {
  document.querySelectorAll('[data-service]').forEach(function (link) {
    link.addEventListener('click', function () {
      const select = document.getElementById('book-service');
      const value = link.getAttribute('data-service');
      Array.from(select.options).forEach(function (option) {
        if (option.value === value) select.value = value;
      });
    });
  });
}
wireServiceLinks();

let installPrompt = null;
window.addEventListener('beforeinstallprompt', function (e) {
  e.preventDefault();
  installPrompt = e;
});
document.getElementById('install-app').addEventListener('click', async function () {
  const help = document.getElementById('install-help');
  if (installPrompt) {
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    return;
  }
  help.textContent = /iphone|ipad|ipod/i.test(navigator.userAgent)
    ? 'On iPhone: tap Share, then Add to Home Screen.'
    : 'Open your browser menu and choose Install app or Add to Home screen.';
});

appendMessage('coach', 'Welcome to SculptifyLTD. I am the Stubbs AI Wellness Guide. Ask me about services, booking or training.');
loadProviders();
loadCourses();
