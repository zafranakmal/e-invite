'use client';

import styles from './WishesSection.module.css';
import WishCard from '../design/WishCard';
import GlassCard from '../design/GlassCard';

export type Wish = { id: string; name: string; message: string };

interface WishesSectionProps {
  wishes: Wish[];
  /** Drives the entry animation once the section scrolls into view. */
  isIn?: boolean;
}

/** Roughly how many fit the viewport at once — below this there's nothing to
    rotate, so the wheel stays still. */
const VISIBLE = 3;
/** Seconds each wish spends crossing the window; total loop scales with count
    so the wheel turns at the same speed whether there are 5 wishes or 50. */
const SECONDS_PER_WISH = 5;

/** Its own card, sharing RsvpSection's surface — Elementor keeps both in
    .e-20ea165-d7890c0. */
export default function WishesSection({ wishes, isIn }: WishesSectionProps) {
  const spins = wishes.length > VISIBLE;

  const reveal = {
    opacity: isIn ? 1 : 0,
    transform: isIn ? 'translateY(0)' : 'translateY(16px)',
    transition: 'opacity 0.6s var(--ease), transform 0.6s var(--ease)',
  };

  return (
    <GlassCard id="wishes">
      <h2 className={styles.heading}>Warm Wishes</h2>
      <p className={styles.subtitle}>From our loved ones</p>

      {wishes.length === 0 ? (
        <p className={styles.empty}>Wishes will appear here.</p>
      ) : (
        <div
          className={`${styles.viewport}${spins ? ' ' + styles.viewportSpinning : ''}`}
          style={reveal}
        >
          <div
            className={styles.track}
            style={spins ? { animationDuration: `${wishes.length * SECONDS_PER_WISH}s` } : undefined}
          >
            {wishes.map((w) => (
              <WishCard key={w.id} name={w.name} message={w.message} />
            ))}

            {/* Second pass. The track animates to exactly -50%, which lands on
                this copy's first card — so the loop has no visible seam. Hidden
                from assistive tech so the wishes aren't announced twice. */}
            {spins &&
              wishes.map((w) => (
                <div key={`loop-${w.id}`} aria-hidden="true">
                  <WishCard name={w.name} message={w.message} />
                </div>
              ))}
          </div>
        </div>
      )}

      <p className={styles.footerText}>
        Thank you for your lovely wishes. We look forward to your presence, prayers, and blessings on this special day.
        <br />
        Bismillahi Barakatillah
      </p>
    </GlassCard>
  );
}
