'use client';

import { CSSProperties } from 'react';
import Image from 'next/image';
import styles from './CountdownSection.module.css';
import Countdown from '../design/Countdown';

/** Elementor countdown widget data-date="1793476800" — 31 Oct 2026, 7.00 PM MYT. */
const WEDDING_DATE = '2026-10-31T19:00:00+08:00';

interface CountdownSectionProps {
  style?: CSSProperties;
}

export default function CountdownSection({ style }: CountdownSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.bg}>
        <Image src="/el-bg-countdown.jpg" alt="" fill sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'left top' }} />
      </div>

      <div className={styles.rail} style={style}>
        <Image
          src="/el-countdown-heading.png"
          alt="Counting down the days"
          width={1024}
          height={538}
          className={styles.heading}
          sizes="(max-width: 1024px) 60vw, 25vw"
        />
        <Countdown target={WEDDING_DATE} variant="elementor" className={styles.clock} />
      </div>
    </section>
  );
}
