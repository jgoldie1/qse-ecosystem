/* Sculptify Source App */

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
        serviceCard('\uD83D\uDC86', 'Body Sculpting', 'Professional contouring and toning sessions tailored to your goals.'),
        serviceCard('\uD83E\uDDBC', 'Massage Therapy', 'Therapeutic massage for relaxation and recovery.'),
        serviceCard('\u2728', 'Reiki & Energy Work', 'Holistic energy healing and Reiki sessions.'),
        serviceCard('\uD83C\uDF3F', 'Acupuncture', 'Traditional acupuncture and acupressure treatments.'),
        serviceCard('\uD83D\uDCBB', 'Virtual Care', 'Remote wellness consultations from anywhere.'),
        serviceCard('\uD83C\uDFCB\uFE0F', 'Personal Training', 'One-on-one fitness coaching to reach your peak.'),
        '</div>'
      ].join('');
    } catch (e) {
      root.innerHTML = '<p style="color:#9ca3af;text-align:center;">Services are loading. Please check back shortly.</p>';
    }
  }

  function serviceCard(icon, title, desc) {
    return [
      '<div style="background:#1e1e1e;border:1px solid #2a2a2a;border-radius:12px;padding:28px;">',
      '<div style="font-size:2rem;margin-bottom:12px;">' + icon + '</div>',
      '<h3 style="font-size:1.1rem;margin-bottom:8px;">' + title + '</h3>',
      '<p style="color:#9ca3af;font-size:0.9rem;">' + desc + '</p>',
      '</div>'
    ].join('');
  }

  render();
})();
