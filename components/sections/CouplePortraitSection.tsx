'use client';

import { CSSProperties } from 'react';
import Image from 'next/image';
import styles from './CouplePortraitSection.module.css';
import GlassCard from '../design/GlassCard';
import couplePortrait from '@/assets/couple-portrait.webp';

interface CouplePortraitSectionProps {
  style?: CSSProperties;
}

/** Sits between the countdown and the RSVP form, in the same glass card both of
    its neighbours use. */
export default function CouplePortraitSection({ style }: CouplePortraitSectionProps) {
  return (
    <section id="couple" className={styles.section}>
      <GlassCard style={style}>
        <h2 className={styles.heading}>The Couple</h2>
        {/* Same sizes ladder as the countdown heading — it fills the identical
            inner column, so it should be asked for at the identical width. */}
        <Image
          src={couplePortrait}
          alt="A collage of photographs of the bride and groom, seated together among red and pink floral arrangements"
          className={styles.portrait}
          sizes="(max-width: 767px) 84vw, (max-width: 1024px) 70vw, 34vw"
        />
      </GlassCard>
    </section>
  );
}
