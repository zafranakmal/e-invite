import { CSSProperties } from 'react';

interface WishCardProps {
  name: string;
  message: string;
  style?: CSSProperties;
}

export default function WishCard({ name, message, style }: WishCardProps) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.45)', borderRadius: 'var(--r-sm)', padding: '0.9rem 1.1rem', textAlign: 'left', ...style }}>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          fontSize: '0.78rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--c-ink)',
          margin: '0 0 0.35rem',
        }}
      >
        {name}
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: '1rem', color: 'var(--c-ink-2)', lineHeight: 'var(--lh-body)', margin: 0 }}>
        {message}
      </p>
    </div>
  );
}
