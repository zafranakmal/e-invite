'use client';

import styles from './WishesSection.module.css';
import WishCard from '../design/WishCard';

export type Wish = { id: string; name: string; message: string };

interface WishesSectionProps {
  wishes: Wish[];
  /** Drives the staggered entry animation once the section scrolls into view. */
  isIn?: boolean;
}

/** Rendered inside RsvpSection's glass card — it owns no background of its own. */
export default function WishesSection({ wishes, isIn }: WishesSectionProps) {
  return (
    <div id="wishes" className={styles.wishes}>
      <h2 className={styles.heading}>Warm Wishes</h2>
      <p className={styles.subtitle}>From our loved ones</p>

      <div className={styles.list}>
        {wishes.length === 0 ? (
          <p className={styles.empty}>Wishes will appear here.</p>
        ) : (
          wishes.map((w, i) => (
            <WishCard
              key={w.id}
              name={w.name}
              message={w.message}
              style={{
                opacity: isIn ? 1 : 0,
                transform: isIn ? 'translateY(0)' : 'translateY(16px)',
                transition: `opacity 0.6s var(--ease) ${i * 0.14}s, transform 0.6s var(--ease) ${i * 0.14}s`,
              }}
            />
          ))
        )}
      </div>

      <p className={styles.footerText}>
        Thank you for your lovely wishes. We look forward to your presence, prayers, and blessings on this special day.
        <br />
        Bismillahi Barakatillah
      </p>
    </div>
  );
}
