import React from 'react';

/**
 * Footer - simple site footer with branding and optional links.
 *
 * Props:
 *   brand     - brand name shown in the copyright line
 *   year      - copyright year (default: current year)
 *   links     - array of { label, href } additional footer links
 *   color     - accent color for links (default: '#a855f7')
 *   style     - additional inline styles for the footer element
 */
function Footer({ brand, year, links = [], color = '#a855f7', style = {} }) {
  const currentYear = year || new Date().getFullYear();

  return (
    <footer
      style={{
        background: '#141414',
        borderTop: '1px solid #2a2a2a',
        padding: '20px 0',
        textAlign: 'center',
        color: '#888',
        fontSize: '0.9rem',
        ...style,
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
        <p>
          &copy; {currentYear} {brand}
          {links.length > 0 && (
            <>
              {' \u2014 '}
              {links.map((link, i) => (
                <React.Fragment key={link.href || link.label}>
                  {i > 0 && ' · '}
                  <a href={link.href} style={{ color, textDecoration: 'none' }}>
                    {link.label}
                  </a>
                </React.Fragment>
              ))}
            </>
          )}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
