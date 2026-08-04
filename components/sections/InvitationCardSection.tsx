'use client';

import { CSSProperties, useEffect, useState } from 'react';
import Image from 'next/image';
import Snowfall from 'react-snowfall';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWaze } from '@fortawesome/free-brands-svg-icons';
import { faLocationDot, faCalendarPlus } from '@fortawesome/free-solid-svg-icons';
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
          <PillButton as="a" href={WAZE_URL} target="_blank" rel="noopener noreferrer" variant="brown" icon={<FontAwesomeIcon icon={faWaze} />} style={pill(0)}>
            Waze
          </PillButton>
          <PillButton as="a" href={MAPS_URL} target="_blank" rel="noopener noreferrer" variant="brown" icon={<FontAwesomeIcon icon={faLocationDot} />} style={pill(1)}>
            Google Maps
          </PillButton>
          {/* Spans both columns on the mobile grid — see .ctaGrid */}
          <PillButton as="a" href={CALENDAR_URL} target="_blank" rel="noopener noreferrer" variant="brown" icon={<FontAwesomeIcon icon={faCalendarPlus} />} style={pill(2)}>
            Add to Calendar
          </PillButton>
        </div>
      </div>
    </section>
  );
}
