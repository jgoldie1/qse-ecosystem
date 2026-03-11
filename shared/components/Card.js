import React from 'react';

/**
 * Card - reusable content card with optional icon, title, body text, and action slot.
 *
 * Props:
 *   icon     - emoji or element shown at the top (optional)
 *   title    - card heading text
 *   body     - subtitle / description text (optional)
 *   color    - accent color used on hover border (default: '#a855f7')
 *   style    - additional inline styles
 *   children - arbitrary content rendered below the header area
 */
function Card({ icon, title, body, color = '#a855f7', style = {}, children }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#1e1e1e',
        border: `1px solid ${hovered ? color : '#2a2a2a'}`,
        borderRadius: '12px',
        padding: '28px',
        transition: 'border-color 0.2s ease',
        ...style,
      }}
    >
      {icon && (
        <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{icon}</div>
      )}
      {title && (
        <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#f5f5f5' }}>{title}</h3>
      )}
      {body && (
        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: children ? '16px' : 0 }}>
          {body}
        </p>
      )}
      {children}
    </div>
  );
}

export default Card;
