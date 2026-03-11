/* March & Lewis Source App */

(function () {
  const root = document.getElementById('sourceApp');
  if (!root) return;

  const API_BASE = '/api';

  async function fetchJSON(url, options) {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }

  async function render() {
    root.innerHTML = '<p style="color:#9ca3af;text-align:center;">Loading...</p>';
    try {
      const health = await fetchJSON(API_BASE + '/health');
      if (health.status !== 'ok') throw new Error('API unavailable');

      root.innerHTML = [
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px;margin-top:20px;">',
        jobCard('\uD83D\uDC54', 'Administrative Assistant', 'Full-time \u2014 Dallas, TX'),
        jobCard('\uD83D\uDCBB', 'IT Support Specialist', 'Full-time \u2014 Remote'),
        jobCard('\uD83C\uDFE5', 'Healthcare Coordinator', 'Part-time \u2014 Houston, TX'),
        jobCard('\uD83D\uDCC8', 'Workforce Analyst', 'Full-time \u2014 Austin, TX'),
        jobCard('\uD83D\uDCCB', 'Recruiter', 'Full-time \u2014 Remote'),
        jobCard('\uD83C\uDF93', 'Training Coordinator', 'Part-time \u2014 Dallas, TX'),
        '</div>'
      ].join('');
    } catch (e) {
      root.innerHTML = '<p style="color:#9ca3af;text-align:center;">Positions are loading. Please check back shortly.</p>';
    }
  }

  function jobCard(icon, title, meta) {
    return [
      '<div style="background:#1e1e1e;border:1px solid #2a2a2a;border-radius:12px;padding:28px;">',
      '<div style="font-size:2rem;margin-bottom:12px;">' + icon + '</div>',
      '<h3 style="font-size:1.1rem;margin-bottom:8px;">' + title + '</h3>',
      '<p style="color:#9ca3af;font-size:0.9rem;">' + meta + '</p>',
      '</div>'
    ].join('');
  }

  render();
})();
