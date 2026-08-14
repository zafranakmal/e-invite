'use client';

import { CSSProperties } from 'react';
import Image from 'next/image';
import styles from './ItinerarySection.module.css';
import itineraryCard from '@/assets/el-itinerary-card.webp';
import dressCode from '@/assets/el-dresscode.webp';

interface ItinerarySectionProps {
  style?: CSSProperties;
}

export default function ItinerarySection({ style }: ItinerarySectionProps) {
  return (
    <section id="itinerary" className={styles.section}>
      <div className={styles.inner} style={style}>
        {/* An imported image carries its own width/height, so the ratio that
            reserves the space can no longer drift from the file — which is what
            put a 1024x538 box around the 744x461 dress code here and shifted the
            layout on load. */}
        <Image
          src={itineraryCard}
          alt="Reception itinerary — 7.00 PM arrival of guests, 8.00 PM arrival of bride and groom, 8.45 PM cake-cutting ceremony, 9.00 PM photography session, 11.00 PM end of reception"
          className={styles.itineraryCard}
          sizes="(max-width: 767px) 92vw, (max-width: 1024px) 78vw, 38vw"
        />

        <Image
          src={dressCode}
          alt="Dress code"
          className={styles.dressCode}
          sizes="(max-width: 767px) 92vw, (max-width: 1024px) 78vw, 38vw"
        />
      </div>
    </section>
  );
}
