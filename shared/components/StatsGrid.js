import React from 'react';

/**
 * StatCard - a single statistic tile showing a number and label.
 *
 * Props:
 *   value  - the numeric or string value to display prominently
 *   label  - descriptive label below the value
 *   color  - accent color for the value (default: '#a855f7')
 *   style  - additional inline styles
 */
function StatCard({ value, label, color = '#a855f7', style = {} }) {
  return (
    <div
      style={{
        background: '#141414',
        border: '1px solid #2a2a2a',
        borderRadius: '12px',
        padding: '24px 36px',
        textAlign: 'center',
        minWidth: '150px',
        ...style,
      }}
    >
      <span style={{ display: 'block', fontSize: '2rem', fontWeight: '700', color }}>{value}</span>
      <span style={{ fontSize: '0.85rem', color: '#888' }}>{label}</span>
    </div>
  );
}

/**
 * StatsGrid - a responsive row of StatCard tiles.
 *
 * Props:
 *   stats  - array of { value, label } objects
 *   color  - accent color forwarded to each StatCard (default: '#a855f7')
 *   style  - additional inline styles for the grid wrapper
 */
function StatsGrid({ stats = [], color = '#a855f7', style = {} }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        margin: '40px auto',
        ...style,
      }}
    >
      {stats.map((s) => (
        <StatCard key={s.label} value={s.value} label={s.label} color={color} />
      ))}
    </div>
  );
}

export { StatCard };
export default StatsGrid;
