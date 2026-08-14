'use client';

import { CSSProperties, Suspense } from 'react';
import Image from 'next/image';
import styles from './CountdownSection.module.css';
import Countdown from '../design/Countdown';
import GlassCard from '../design/GlassCard';
import { getInviteVariant, useInviteVariant } from '../../lib/invite-variant';
import countdownHeading from '@/assets/el-countdown-heading.webp';

/* useSearchParams (via useInviteVariant) needs its own Suspense boundary, kept
   as tight as the clock itself — see InvitationCardSection.tsx for why this
   can't be left to bubble up to a boundary further up the tree. */
const DEFAULT_TARGET = getInviteVariant(null).countdownTarget;

function CountdownClock() {
  // Counts down to the start of this guest's own window, not the reception's —
  // Elementor's data-date="1793476800" (31 Oct 2026, 7.00 PM MYT) is the default.
  const { countdownTarget } = useInviteVariant();
  return <Countdown target={countdownTarget} variant="elementor" className={styles.clock} />;
}

interface CountdownSectionProps {
  style?: CSSProperties;
}

export default function CountdownSection({ style }: CountdownSectionProps) {
  return (
    <section className={styles.section}>
      <GlassCard style={style}>
        <Image
          src={countdownHeading}
          alt="Counting down the days"
          className={styles.heading}
          sizes="(max-width: 767px) 84vw, (max-width: 1024px) 70vw, 34vw"
        />
        <Suspense fallback={<Countdown target={DEFAULT_TARGET} variant="elementor" className={styles.clock} />}>
          <CountdownClock />
        </Suspense>
      </GlassCard>
    </section>
  );
}
