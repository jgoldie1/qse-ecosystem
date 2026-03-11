/**
 * statsBar – updates the hero stats counters from analytics data
 */
export async function loadStats(apiBase) {
  try {
    const healthRes = await fetch(`${apiBase}/health`);
    const health = await healthRes.json();
    if (health.status !== 'ok') return;

    const analyticsRes = await fetch('/data/analytics.json').catch(() => null);
    if (!analyticsRes || !analyticsRes.ok) return;
    const analytics = await analyticsRes.json().catch(() => null);

    if (analytics && analytics.marchLewis) {
      updateEl('#stat-applications .stat-number', analytics.marchLewis.jobApplications);
      updateEl('#stat-employers .stat-number', analytics.marchLewis.employerRequests);
      updateEl('#stat-training .stat-number', analytics.marchLewis.trainingEnrollments);
    }
  } catch {
    // silently ignore
  }
}

function updateEl(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.textContent = value ?? 0;
}
