import React from 'react';

function Card({ icon, title, subtitle, children, style = {} }) {
  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '20px',
      minWidth: '200px',
      ...style,
    }}>
      {icon && <div style={{ fontSize: '1.8rem', marginBottom: '10px' }}>{icon}</div>}
      {title && <h3 style={{ marginBottom: '8px', marginTop: 0 }}>{title}</h3>}
      {subtitle && <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>{subtitle}</p>}
      {children}
    </div>
  );
}

export default Card;
