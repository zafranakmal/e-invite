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
        <Image
          src="/el-itinerary-card.png"
          alt="Reception itinerary — 7.00 PM arrival of guests, 8.00 PM arrival of bride and groom, 8.45 PM cake-cutting ceremony, 9.00 PM photography session, 11.00 PM end of reception"
          width={1409}
          height={2000}
          className={styles.itineraryCard}
          sizes="(max-width: 767px) 92vw, (max-width: 1024px) 78vw, 38vw"
        />

        {/* 744x461 is the file's real size — the 1024x538 declared here before
            reserved space at the wrong ratio and shifted the layout on load. */}
        <Image
          src="/el-dresscode.png"
          alt="Dress code"
          width={744}
          height={461}
          className={styles.dressCode}
          sizes="(max-width: 767px) 92vw, (max-width: 1024px) 78vw, 38vw"
        />
      </div>
    </section>
  );
}
