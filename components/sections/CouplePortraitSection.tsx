'use client';

import { CSSProperties } from 'react';
import Image from 'next/image';
import styles from './CouplePortraitSection.module.css';
import couplePortrait from '@/assets/couple-portrait.webp';

interface CouplePortraitSectionProps {
  style?: CSSProperties;
}

/** Sits between the countdown and the RSVP form. No glass card: the collage is
    already a stack of white plates, so a frosted panel behind it read as a
    second card around the first. It stands on the backdrop like the itinerary
    artwork instead, on the same --card-w measure as the cards either side. */
export default function CouplePortraitSection({ style }: CouplePortraitSectionProps) {
  return (
    <section id="couple" className={styles.section}>
      {/* The reveal rides on the wrapper, as it does in ItinerarySection — the
          section itself has to stay put for the observer to have something
          stable to watch. */}
      <div className={styles.inner} style={style}>
        {/* Heading and date are one block so the section's --sec-gap only
            separates the type from the photo, not the date from its title. */}
        <header className={styles.type}>
          <h2 className={styles.heading}>Snapshots from Our Engagement</h2>
          <p className={styles.date}>27.06.2026</p>
        </header>

        <Image
          src={couplePortrait}
          alt="A collage of photographs from the couple's engagement, seated together among red and pink floral arrangements"
          className={styles.portrait}
          sizes="(max-width: 767px) 92vw, (max-width: 1024px) 78vw, 38vw"
        />
      </div>
    </section>
  );
}
