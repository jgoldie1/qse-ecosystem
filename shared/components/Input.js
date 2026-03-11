import React from 'react';

/**
 * Input - reusable styled text input or select.
 *
 * Props:
 *   as          - 'input' | 'select' | 'textarea' (default: 'input')
 *   color       - focus border accent color (default: '#a855f7')
 *   style       - additional inline styles
 *   children    - option elements when as='select'
 *   All other props are forwarded to the underlying element.
 */
function Input({ as = 'input', color = '#a855f7', style = {}, children, ...props }) {
  const [focused, setFocused] = React.useState(false);

  const baseStyle = {
    background: '#1e1e1e',
    border: `1px solid ${focused ? color : '#2a2a2a'}`,
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#f5f5f5',
    fontSize: '0.95rem',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    ...style,
  };

  const handlers = {
    onFocus: (e) => {
      setFocused(true);
      if (props.onFocus) props.onFocus(e);
    },
    onBlur: (e) => {
      setFocused(false);
      if (props.onBlur) props.onBlur(e);
    },
  };

  if (as === 'select') {
    return (
      <select style={baseStyle} {...props} {...handlers}>
        {children}
      </select>
    );
  }

  if (as === 'textarea') {
    return <textarea style={{ ...baseStyle, resize: 'vertical' }} {...props} {...handlers} />;
  }

  return <input style={baseStyle} {...props} {...handlers} />;
}

export default Input;
