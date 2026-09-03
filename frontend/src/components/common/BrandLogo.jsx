import React from 'react';

export default function BrandLogo({ theme = 'dark', size = 'md', onClick }) {
  const isLight = theme === 'light'; // light text on dark background
  const textColor = isLight ? '#FFFFFF' : 'var(--text-dark)';
  const iconColor = isLight ? '#6EE7B7' : '#0B3B32';

  const iconSizes = {
    sm: 20,
    md: 26,
    lg: 32,
  };

  const fontSizes = {
    sm: '1.05rem',
    md: '1.25rem',
    lg: '1.5rem',
  };

  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        textDecoration: 'none',
      }}
    >
      {/* Wordmark */}

      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 700,
          fontSize: fontSizes[size] || '1.25rem',
          color: textColor,
          letterSpacing: '-0.02em',
        }}
      >
        NirmalSagar
      </span>
    </div>
  );
}
