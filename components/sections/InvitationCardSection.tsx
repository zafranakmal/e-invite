'use client';

import { CSSProperties, useEffect, useState } from 'react';
import Image from 'next/image';
import Snowfall from 'react-snowfall';
import styles from './InvitationCardSection.module.css';
import PillButton from '../design/PillButton';

const WAZE_URL = 'https://waze.com/ul/hw282984j5';
const MAPS_URL = 'https://maps.app.goo.gl/hrAxPHoTWdKjrtNJ6';
const CALENDAR_URL =
  'https://www.google.com/calendar/render?action=TEMPLATE' +
  '&text=Anis+%26+Zafran+Wedding' +
  '&dates=20261031T190000/20261031T230000' +
  '&details=Walimatul+Urus' +
  '&location=Grand+Ballroom,+BoraOmbak+Marina+Putrajaya';

const PARENTS = [
  'Ismail bin Tawnie',
  'Nor Raba’ah binti Zakaria',
  'dan',
  'Haji Zainol Hisham bin Osman',
  'Zahariyah binti Yeop',
];

const INVITE_LINES = [
  'dengan penuh kesyukuran menjemput',
  'Tan Sri / Puan Sri / Dato’ Seri / Datin Seri /',
  'Dato’ / Datin / Tuan / Puan dan pasangan',
  'hadir ke majlis perkahwinan anakanda kami',
];

const DETAIL_LINES = ['Sabtu, 31 Oktober 2026', '7.00 PM – 11.00 PM', 'Grand Ballroom,', 'BoraOmbak Putrajaya'];

const WazeIcon = () => (
  <svg viewBox="0 0 32 32" width="18" height="18" fill="none" aria-hidden="true">
    <path d="M16 3C9.9 3 5 7.7 5 13.5c0 4.8 3.1 8.9 7.5 10.5L11 29l5-3.5 5 3.5-1.5-5C24 21.9 27 17.5 27 13.5 27 7.7 22.1 3 16 3z" fill="#00d5d6" />
    <circle cx="12.5" cy="13" r="1.8" fill="white" />
    <circle cx="19.5" cy="13" r="1.8" fill="white" />
    <path d="M12 18c1.5 2.5 7 2.5 8 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

const MapsIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
    <path d="M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7z" fill="#EA4335" />
    <circle cx="12" cy="9" r="2.5" fill="white" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 448 512" width="15" height="15" fill="currentColor" aria-hidden="true">
    <path d="M336 292v24c0 6.6-5.4 12-12 12h-76v76c0 6.6-5.4 12-12 12h-24c-6.6 0-12-5.4-12-12v-76h-76c-6.6 0-12-5.4-12-12v-24c0-6.6 5.4-12 12-12h76v-76c0-6.6 5.4-12 12-12h24c6.6 0 12 5.4 12 12v76h76c6.6 0 12 5.4 12 12zm112-180v352c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V112c0-26.5 21.5-48 48-48h48V12c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v52h128V12c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v52h48c26.5 0 48 21.5 48 48zm-48 346V160H48v298c0 3.3 2.7 6 6 6h340c3.3 0 6-2.7 6-6z" />
  </svg>
);

interface InvitationCardSectionProps {
  revealed: boolean;
}

function fadeUp(isIn: boolean, delay: string): CSSProperties {
  return {
    opacity: isIn ? 1 : 0,
    transform: isIn ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.7s var(--ease) ${delay}, transform 0.7s var(--ease) ${delay}`,
  };
}

export default function InvitationCardSection({ revealed }: InvitationCardSectionProps) {
  const [snowflakeCount, setSnowflakeCount] = useState(60);

  useEffect(() => {
    const update = () => setSnowflakeCount(Math.round((10 * window.innerWidth) / 100));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const pill = (i: number): CSSProperties => ({
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 0.5s var(--ease) ${0.3 + i * 0.12}s, transform 0.5s var(--ease) ${0.3 + i * 0.12}s`,
  });

  return (
    <section className={styles.section}>
      <div className={styles.bg}>
        <Image
          src="/el-bg-invitation.png"
          alt=""
          fill
          sizes="100vw"
          priority
          style={{ objectFit: 'cover', objectPosition: 'left top' }}
        />
      </div>

      <Snowfall
        snowflakeCount={snowflakeCount}
        color="rgba(248, 243, 242, 0.62)"
        radius={[2.3, 4]}
        speed={[0.7, 1.5]}
        wind={[-0.5, 0.5]}
        style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}
      />

      <div className={styles.card}>
        <Image
          src="/el-invitation-card-blank.png"
          alt=""
          fill
          sizes="(max-width: 767px) 92vw, 60vh"
          className={styles.cardArt}
          priority
        />

        <div className={styles.type}>
          <div className={styles.parents} style={fadeUp(revealed, '0.15s')}>
            {PARENTS.map((line) => (
              <p key={line} className={line === 'dan' ? styles.dan : undefined}>
                {line}
              </p>
            ))}
          </div>

          <div className={styles.invite} style={fadeUp(revealed, '0.3s')}>
            {INVITE_LINES.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          <h1 className={styles.couple} style={fadeUp(revealed, '0.45s')}>
            Anis Sufea &amp;
            <br />
            Zafran Akmal
          </h1>

          <div className={styles.details} style={fadeUp(revealed, '0.6s')}>
            {DETAIL_LINES.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.ctaWrap}>
        <div className={styles.ctaGrid}>
          <PillButton as="a" href={WAZE_URL} target="_blank" rel="noopener noreferrer" variant="brown" icon={<WazeIcon />} style={pill(0)}>
            Waze
          </PillButton>
          <PillButton as="a" href={MAPS_URL} target="_blank" rel="noopener noreferrer" variant="brown" icon={<MapsIcon />} style={pill(1)}>
            Google Maps
          </PillButton>
          <PillButton as="a" href={CALENDAR_URL} target="_blank" rel="noopener noreferrer" variant="brown" icon={<CalendarIcon />} style={pill(2)}>
            Add to Calendar
          </PillButton>
        </div>
      </div>
    </section>
  );
}
