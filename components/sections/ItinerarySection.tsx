'use client';

import { CSSProperties } from 'react';
import Image from 'next/image';
import styles from './ItinerarySection.module.css';
import itineraryCard from '@/assets/el-itinerary-card.webp';
import dressCode from '@/assets/el-dresscode.webp';

/* The reception runs one programme but seats two sittings, so the card above
   (7 PM to 11 PM end to end) is not the window any single guest is asked for.
   Printed here rather than baked into the artwork so the split can be reworded
   without a new plate. The per-guest window is on the invitation card itself,
   set by ?t= — see lib/invite-variant.ts. */
const SESSIONS = [
  { label: '1st Session', time: '7.00 pm – 9.00 pm' },
  { label: '2nd Session', time: '9.00 pm – 11.00 pm' },
];

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
          alt="Reception itinerary — 7.00 PM arrival of guests, 8.00 PM arrival of bride and groom, 9.30 PM cake-cutting ceremony, 9.45 PM photography session, 11.00 PM end of reception"
          className={styles.itineraryCard}
          sizes="(max-width: 767px) 92vw, (max-width: 1024px) 78vw, 38vw"
        />

        <div className={styles.sessions}>
          <p className={styles.sessionsIntro}>
            To accommodate all our guests comfortably, the attendance is split into
            two sessions:
          </p>

          <dl className={styles.sessionList}>
            {SESSIONS.map(({ label, time }) => (
              <div key={label} className={styles.sessionRow}>
                <dt className={styles.sessionLabel}>{label}</dt>
                <dd className={styles.sessionTime}>{time}</dd>
              </div>
            ))}
          </dl>

          <p className={styles.sessionsRefer}>Please kindly refer to your invitation.</p>
        </div>

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
