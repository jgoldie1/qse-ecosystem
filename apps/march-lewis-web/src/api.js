/* March & Lewis — API Client */

export const API_BASE = '/api';

export async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Health
export function getHealth() {
  return fetchJSON(`${API_BASE}/health`);
}

// Training
export function getTrainingCourses() {
  return fetchJSON(`${API_BASE}/training/courses`);
}

export function enrollCourse(userId, courseId) {
  return fetchJSON(`${API_BASE}/training/enroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, courseId })
  });
}

export function getTrainingProgress(userId) {
  return fetchJSON(`${API_BASE}/training/progress/${encodeURIComponent(userId)}`);
}

// AI Coach
export function sendCoachMessage(message, context = 'marchLewis') {
  return fetchJSON(`${API_BASE}/ai/coach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context })
  });
}

export function getCoachTips() {
  return fetchJSON(`${API_BASE}/ai/coach/tips`);
}

// Tasks (used for form submissions)
export function getTasks() {
  return fetchJSON(`${API_BASE}/tasks`);
}

export function createTask(taskData) {
  return fetchJSON(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
}

export function updateTask(id, updates) {
  return fetchJSON(`${API_BASE}/tasks/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
}

export function deleteTask(id) {
  return fetchJSON(`${API_BASE}/tasks/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

// Wallets
export function getWallet(userId) {
  return fetchJSON(`${API_BASE}/wallets/${encodeURIComponent(userId)}`);
}

// Rewards
export function getRewards() {
  return fetchJSON(`${API_BASE}/rewards`);
}

// Memberships
export function getMemberships() {
  return fetchJSON(`${API_BASE}/memberships/tiers`);
}
