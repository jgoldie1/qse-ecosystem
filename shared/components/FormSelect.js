import React from 'react';

function FormSelect({ id, label, options = [], value, onChange, required = false, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && (
        <label htmlFor={id} style={{ color: '#aaa', fontSize: '0.9rem' }}>
          {label}
        </label>
      )}
      <select
        id={id}
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
          cursor: 'pointer',
          ...style,
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FormSelect;
