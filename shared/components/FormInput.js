import React from 'react';

function FormInput({ id, label, type = 'text', placeholder, value, onChange, required = false, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && (
        <label htmlFor={id} style={{ color: '#aaa', fontSize: '0.9rem' }}>
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '6px',
          padding: '10px',
          color: '#f5f5f5',
          outline: 'none',
          fontSize: '0.95rem',
          ...style,
        }}
      />
    </div>
  );
}

export default FormInput;
