'use client';

import { CSSProperties, useEffect, useState } from 'react';

function computeParts(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
    done: false,
  };
}

interface CountdownProps {
  target: string;
  pastMessage?: string;
  style?: CSSProperties;
}

export default function Countdown({ target, pastMessage = 'The celebration has begun.', style }: CountdownProps) {
  const [parts, setParts] = useState<{ days: number | string; hours: number | string; minutes: number | string; seconds: number | string; done: boolean }>({
    days: '--',
    hours: '--',
    minutes: '--',
    seconds: '--',
    done: false,
  });

  useEffect(() => {
    const t = new Date(target);
    const tick = () => setParts(computeParts(t));
    tick();
    const id = setInterval(tick, 1000);
    const onVis = () => { if (document.visibilityState === 'visible') tick(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [target]);

  if (parts.done) {
    return (
      <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--c-ink-2)', ...style }}>
        {pastMessage}
      </p>
    );
  }

  const units: Array<[keyof typeof parts, string]> = [
    ['days', 'Days'],
    ['hours', 'Hours'],
    ['minutes', 'Mins'],
    ['seconds', 'Secs'],
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, ...style }}>
      {units.map(([key, label], i) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 56 }}>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(2rem, 6vw, 2.6rem)',
                color: 'var(--c-ink)',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '0.04em',
                lineHeight: 1,
              }}
            >
              {String(parts[key]).padStart(2, '0')}
            </span>
            <span
              style={{
                fontSize: '0.58rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--c-ink-mute)',
                marginTop: '0.25rem',
              }}
            >
              {label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.6rem',
                color: 'var(--c-line)',
                padding: '0 0.1rem',
                marginBottom: '1rem',
                userSelect: 'none',
              }}
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
