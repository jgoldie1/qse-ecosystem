import React from 'react';

function StatsGrid({ stats = [], style = {} }) {
  return (
    <div style={{
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap',
      marginBottom: '32px',
      ...style,
    }}>
      {stats.map((stat, i) => (
        <div key={stat.label || i} style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '20px 28px',
          minWidth: '140px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: stat.color || '#fff' }}>
            {stat.value}
          </div>
          <div style={{ color: '#888', fontSize: '0.85rem', marginTop: '4px' }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsGrid;
