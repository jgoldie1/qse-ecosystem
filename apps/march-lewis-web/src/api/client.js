/* March & Lewis — API Client */

const API_BASE = '/api';

export async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Health
  getHealth: () => fetchJSON(`${API_BASE}/health`),

  // Tasks (used for applications & employer requests)
  getTasks: () => fetchJSON(`${API_BASE}/tasks`),
  createTask: (data) =>
    fetchJSON(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  updateTask: (id, data) =>
    fetchJSON(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  deleteTask: (id) =>
    fetchJSON(`${API_BASE}/tasks/${id}`, { method: 'DELETE' }),

  // Training
  getCourses: () => fetchJSON(`${API_BASE}/training/courses`),
  enrollCourse: (userId, courseId) =>
    fetchJSON(`${API_BASE}/training/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, courseId }),
    }),
  getProgress: (userId) =>
    fetchJSON(`${API_BASE}/training/progress/${userId}`),

  // AI Coach
  askCoach: (message, context = 'marchLewis') =>
    fetchJSON(`${API_BASE}/ai/coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context }),
    }),
  getCoachTips: () => fetchJSON(`${API_BASE}/ai/coach/tips`),

  // Rewards
  getRewards: () => fetchJSON(`${API_BASE}/rewards`),
  getUserRewards: (userId) => fetchJSON(`${API_BASE}/rewards/user/${userId}`),
  issueReward: (userId, type, amount) =>
    fetchJSON(`${API_BASE}/rewards/issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, type, amount }),
    }),

  // Memberships
  getMembershipTiers: () => fetchJSON(`${API_BASE}/memberships/tiers`),
  getUserMembership: (userId) =>
    fetchJSON(`${API_BASE}/memberships/user/${userId}`),
  subscribe: (userId, tier) =>
    fetchJSON(`${API_BASE}/memberships/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, tier }),
    }),
};
