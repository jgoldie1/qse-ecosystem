const StatsGrid = require('../../../../shared/components/StatsGrid');

function AdminStats(metrics = {}) {
  return StatsGrid([
    { label: 'Providers', value: metrics.providers || 0 },
    { label: 'Bookings', value: metrics.bookings || 0 },
    { label: 'Onboarding', value: metrics.onboarding || 0 }
  ]);
}

module.exports = AdminStats;
