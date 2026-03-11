import React from 'react';

/**
 * DashboardPanel - a styled section wrapper used inside dashboard/app pages.
 *
 * Props:
 *   title     - section heading (optional)
 *   alt       - use the alternate (slightly lighter) surface background
 *   style     - additional inline styles for the section element
 *   children  - panel content
 */
function DashboardPanel({ title, alt = false, style = {}, children }) {
  return (
    <section
      style={{
        padding: '60px 0',
        background: alt ? '#141414' : 'transparent',
        ...style,
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        {title && (
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              marginBottom: '30px',
              textAlign: 'center',
              color: '#f5f5f5',
            }}
          >
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
}

export default DashboardPanel;
