const API_BASE = '/api';

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

module.exports = {
  get: (path) => fetchJSON(`${API_BASE}${path}`),
  post: (path, body) => fetchJSON(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
};
