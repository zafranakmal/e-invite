'use client';

import { CSSProperties } from 'react';
import Image from 'next/image';
import styles from './CountdownSection.module.css';
import Countdown from '../design/Countdown';
import GlassCard from '../design/GlassCard';
import { useInviteVariant } from '../../lib/invite-variant';
import countdownHeading from '@/assets/el-countdown-heading.webp';

interface CountdownSectionProps {
  style?: CSSProperties;
}

export default function CountdownSection({ style }: CountdownSectionProps) {
  // Counts down to the start of this guest's own window, not the reception's —
  // Elementor's data-date="1793476800" (31 Oct 2026, 7.00 PM MYT) is the default.
  const { countdownTarget } = useInviteVariant();

  return (
    <section className={styles.section}>
      <GlassCard style={style}>
        <Image
          src={countdownHeading}
          alt="Counting down the days"
          className={styles.heading}
          sizes="(max-width: 767px) 84vw, (max-width: 1024px) 70vw, 34vw"
        />
        <Countdown target={countdownTarget} variant="elementor" className={styles.clock} />
      </GlassCard>
    </section>
  );
}
