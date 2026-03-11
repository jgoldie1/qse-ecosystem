import React from 'react';
import Button from './Button';

/**
 * Hero - full-width hero section with gradient title, subtitle, and action buttons.
 *
 * Props:
 *   title      - main heading text
 *   subtitle   - descriptive paragraph below the title
 *   actions    - array of { label, href, variant } objects for CTA buttons
 *   color      - primary accent color used in gradient and buttons (default: '#a855f7')
 *   colorEnd   - second gradient color (default: '#ec4899')
 *   style      - additional inline styles for the section wrapper
 */
function Hero({ title, subtitle, actions = [], color = '#a855f7', colorEnd = '#ec4899', style = {} }) {
  return (
    <section
      style={{
        padding: '80px 0 60px',
        textAlign: 'center',
        ...style,
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        <h1
          style={{
            fontSize: '3rem',
            fontWeight: '800',
            marginBottom: '16px',
            background: `linear-gradient(135deg, ${color}, ${colorEnd})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            style={{
              fontSize: '1.2rem',
              color: '#888',
              maxWidth: '560px',
              margin: '0 auto 32px',
            }}
          >
            {subtitle}
          </p>
        )}

        {actions.length > 0 && (
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {actions.map((action) => (
              <a key={action.label || action.href} href={action.href} style={{ textDecoration: 'none' }}>
                <Button variant={action.variant || 'primary'} color={color}>
                  {action.label}
                </Button>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Hero;
