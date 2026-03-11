const StatsGrid = require('../../../../shared/components/StatsGrid');

function AdminStats(metrics = {}) {
  return StatsGrid([
    { label: 'Jobs', value: metrics.jobs || 0 },
    { label: 'Employers', value: metrics.employers || 0 },
    { label: 'Candidates', value: metrics.candidates || 0 }
  ]);
}

module.exports = AdminStats;
