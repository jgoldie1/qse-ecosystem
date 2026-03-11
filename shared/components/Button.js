import React from 'react';

function Button({ children, onClick, type = 'button', variant = 'primary', color = '#6c63ff', disabled = false, style = {} }) {
  const base = {
    border: 'none',
    borderRadius: '6px',
    padding: '12px 20px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: '600',
    fontSize: '0.95rem',
    opacity: disabled ? 0.6 : 1,
    transition: 'opacity 0.2s',
  };

  const variants = {
    primary: { background: color, color: '#fff' },
    outline: { background: 'transparent', color: color, border: `1px solid ${color}` },
    ghost: { background: 'transparent', color: color },
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
