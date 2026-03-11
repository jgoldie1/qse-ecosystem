import React, { useState } from 'react';

/**
 * Header - sticky top navigation header with logo, nav links, and optional status badge.
 *
 * Props:
 *   logo        - brand name / logo text
 *   color       - accent color for logo and active link (default: '#a855f7')
 *   navLinks    - array of { label, href } navigation items
 *   status      - optional status string shown as a green badge (e.g. 'online')
 *   style       - additional inline styles for the header element
 */
function NavLink({ href, label }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      style={{
        color: hovered ? '#f5f5f5' : '#888',
        fontSize: '0.95rem',
        textDecoration: 'none',
        transition: 'color 0.2s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </a>
  );
}

function Header({ logo, color = '#a855f7', navLinks = [], status, style = {} }) {
  return (
    <header
      style={{
        background: '#141414',
        borderBottom: '1px solid #2a2a2a',
        padding: '16px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        ...style,
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '1.5rem', fontWeight: '700', color }}>{logo}</span>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </nav>

        {status && (
          <span style={{ fontSize: '0.8rem', color: '#4ade80' }}>● {status}</span>
        )}
      </div>
    </header>
  );
}

export default Header;
