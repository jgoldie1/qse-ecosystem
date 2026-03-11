import React from 'react';

/**
 * Button - reusable button component supporting primary and outline variants.
 *
 * Props:
 *   variant   - 'primary' | 'outline' (default: 'primary')
 *   color     - CSS color string used as the accent (default: '#a855f7')
 *   onClick   - click handler
 *   type      - button type attribute (default: 'button')
 *   disabled  - disabled state
 *   style     - additional inline styles
 *   children  - button label / content
 */
function Button({
  variant = 'primary',
  color = '#a855f7',
  onClick,
  type = 'button',
  disabled = false,
  style = {},
  children,
}) {
  const base = {
    display: 'inline-block',
    padding: '10px 22px',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    transition: 'opacity 0.2s ease',
    textDecoration: 'none',
    opacity: disabled ? 0.5 : 1,
  };

  const variants = {
    primary: {
      background: color,
      color: '#fff',
      border: 'none',
    },
    outline: {
      background: 'transparent',
      color: color,
      border: `2px solid ${color}`,
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...(variants[variant] || variants.primary), ...style }}
    >
      {children}
    </button>
  );
}

export default Button;
