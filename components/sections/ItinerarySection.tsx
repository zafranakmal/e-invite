'use client';

import { CSSProperties } from 'react';
import Image from 'next/image';
import styles from './ItinerarySection.module.css';

interface ItinerarySectionProps {
  style?: CSSProperties;
}

export default function ItinerarySection({ style }: ItinerarySectionProps) {
  return (
    <section id="itinerary" className={styles.section}>
      <div className={styles.inner} style={style}>
        <div className={styles.rail}>
          <Image
            src="/el-itinerary-card.png"
            alt="Reception itinerary — 7.00 PM arrival of guests, 8.00 PM arrival of bride and groom, 8.45 PM cake-cutting ceremony, 9.00 PM photography session, 11.00 PM end of reception"
            width={1409}
            height={2000}
            className={styles.itineraryCard}
            sizes="(max-width: 1024px) 100vw, 34vw"
          />
        </div>

        <div className={`${styles.rail} ${styles.dressRail}`}>
          <Image
            src="/el-dresscode.png"
            alt="Dress code"
            width={1024}
            height={538}
            className={styles.dressCode}
            sizes="(max-width: 1024px) 98vw, 80vw"
          />
        </div>
      </div>
    </section>
  );
}
