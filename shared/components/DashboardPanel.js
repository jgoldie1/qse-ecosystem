import React from 'react';

function DashboardPanel({ title, children, style = {} }) {
  return (
    <section style={{
      background: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '24px',
      marginBottom: '24px',
      ...style,
    }}>
      {title && (
        <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.2rem', color: '#f5f5f5' }}>
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

export default DashboardPanel;
