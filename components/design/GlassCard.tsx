import { CSSProperties, ReactNode } from 'react';
import styles from './GlassCard.module.css';

interface GlassCardProps {
  children: ReactNode;
  /** Anchor id — BottomNav scrolls to these. */
  id?: string;
  style?: CSSProperties;
}

export default function GlassCard({ children, id, style }: GlassCardProps) {
  return (
    <div id={id} className={styles.glass} style={style}>
      <div className={styles.inner}>{children}</div>
    </div>
  );
}
