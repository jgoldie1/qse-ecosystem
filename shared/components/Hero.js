import React from 'react';

function Hero({ title, subtitle, cta, onCta, color = '#6c63ff', style = {} }) {
  return (
    <section style={{
      padding: '48px 0',
      textAlign: 'center',
      ...style,
    }}>
      <h1 style={{ fontSize: '2.5rem', color, marginBottom: '12px' }}>{title}</h1>
      {subtitle && (
        <p style={{ color: '#888', fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto 28px' }}>
          {subtitle}
        </p>
      )}
      {cta && (
        <button
          onClick={onCta}
          style={{
            background: color,
            border: 'none',
            color: '#fff',
            padding: '14px 32px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          {cta}
        </button>
      )}
    </section>
  );
}

export default Hero;
