import React from 'react';

function Footer({ text, links = [], style = {} }) {
  return (
    <footer style={{
      borderTop: '1px solid #222',
      marginTop: '48px',
      paddingTop: '20px',
      color: '#555',
      fontSize: '0.85rem',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      alignItems: 'center',
      ...style,
    }}>
      {text && <span>{text}</span>}
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          style={{ color: '#888', textDecoration: 'none' }}
        >
          {link.label}
        </a>
      ))}
    </footer>
  );
}

export default Footer;
