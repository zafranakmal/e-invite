import { CSSProperties, ReactNode } from 'react';

type Variant = 'medallion' | 'rect' | 'quilted';
type Tone = 'paper' | 'cream';

const SCALLOP_PATHS: Record<Variant, string> = {
  medallion:
    'M150 8c10 14 26 10 34 22 12-6 26 4 30 18 14-2 24 10 24 24 12 4 18 18 14 30 10 8 12 24 4 34 6 12-2 26-14 30 0 14-12 24-24 24-4 14-18 22-32 18-8 12-24 16-36 8-12 8-28 4-36-8-14 4-28-4-32-18-12 0-24-10-24-24-12-4-20-18-14-30-8-10-6-26 4-34-4-12 6-24 20-24 4-14 18-24 30-18C74 20 88 10 100 8c8 8 18 8 26 0z',
  rect:
    'M20 6h260c8 8 8 16 0 24 8 8 8 16 0 24s-8 16 0 24-8 16 0 24-8 16 0 24-8 16 0 24-8 16 0 24H20c-8-8-8-16 0-24-8-8-8-16 0-24s-8-16 0-24-8-16 0-24-8-16 0-24-8-16 0-24-8-16 0-24z',
  quilted:
    'M16 4h268c6 6 6 12 0 18 6 6 6 12 0 18s6 12 0 18-6 12 0 18-6 12 0 18-6 12 0 18-6 12 0 18-6 12 0 18H16c-6-6-6-12 0-18-6-6-6-12 0-18s-6-12 0-18 6-12 0-18-6-12 0-18 6-12 0-18-6-12 0-18-6-12 0-18z',
};

const VIEWBOX: Record<Variant, string> = {
  medallion: '0 0 300 360',
  rect: '0 0 300 178',
  quilted: '0 0 300 152',
};

interface ScallopCardProps {
  variant?: Variant;
  tone?: Tone;
  children: ReactNode;
  style?: CSSProperties;
}

export default function ScallopCard({ variant = 'rect', tone = 'paper', children, style }: ScallopCardProps) {
  const path = SCALLOP_PATHS[variant];
  const bg = tone === 'cream' ? 'var(--c-bg-raised)' : 'var(--c-paper)';

  return (
    <div style={{ position: 'relative', width: '100%', ...style }}>
      <svg
        viewBox={VIEWBOX[variant]}
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
      >
        <path d={path} fill={bg} stroke="var(--c-paper-edge)" strokeWidth="1" />
      </svg>
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: variant === 'medallion' ? 'var(--s-8) var(--s-6)' : 'var(--s-6) var(--s-5)',
          boxShadow: 'var(--shadow-emboss)',
          borderRadius: 'var(--r-card)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
