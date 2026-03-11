import React from 'react';

function Header({ title, subtitle, color = '#6c63ff', health, style = {} }) {
  return (
    <header style={{
      borderBottom: '1px solid #222',
      paddingBottom: '16px',
      marginBottom: '32px',
      ...style,
    }}>
      <h1 style={{ color, margin: '0 0 4px' }}>{title}</h1>
      {subtitle && <p style={{ color: '#888', margin: '0 0 8px' }}>{subtitle}</p>}
      {health && (
        <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>● {health}</span>
      )}
    </header>
  );
}

export default Header;
