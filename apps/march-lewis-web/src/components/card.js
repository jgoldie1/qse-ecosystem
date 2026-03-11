/* March & Lewis — Card Component */

export function createCard({ icon = '', title = '', body = '', actions = '' } = {}) {
  return `
    <div class="card">
      ${icon ? `<div class="card-icon">${icon}</div>` : ''}
      ${title ? `<h3>${title}</h3>` : ''}
      ${body ? `<p>${body}</p>` : ''}
      ${actions ? `<div class="card-actions">${actions}</div>` : ''}
    </div>
  `;
}

export function createJobCard({ id = '', title = '', type = '', location = '', icon = '💼' } = {}) {
  return `
    <div class="card job-card" data-job-id="${id}">
      <div class="card-icon">${icon}</div>
      <h3>${title}</h3>
      <p>${type} &mdash; ${location}</p>
      <a href="/march-lewis/candidate-onboarding.html?role=${encodeURIComponent(title)}" class="btn btn-outline">Apply Now</a>
    </div>
  `;
}

export function createCourseCard({ id = '', title = '', duration = '', app = '' } = {}) {
  return `
    <div class="card course-card" data-course-id="${id}">
      <div class="card-icon">🎓</div>
      <h3>${title}</h3>
      <p>Duration: ${duration}</p>
      <button class="btn btn-outline enroll-btn" data-course-id="${id}">Enroll Free</button>
    </div>
  `;
}
