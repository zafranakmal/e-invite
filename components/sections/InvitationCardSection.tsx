'use client';

import { CSSProperties, Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWaze } from '@fortawesome/free-brands-svg-icons';
import { faLocationDot, faCalendarPlus } from '@fortawesome/free-solid-svg-icons';
import styles from './InvitationCardSection.module.css';
import PillButton from '../design/PillButton';
import { getInviteVariant, useInviteVariant } from '../../lib/invite-variant';
import bgInvitation from '@/assets/el-bg-invitation.webp';
import cardBlank from '@/assets/el-invitation-card-blank.webp';

/* Reading ?p= / ?t= (useSearchParams) forces whatever it's nested in to bail out of
   static rendering into a Suspense fallback — that used to be the *entire*
   InvitationContent tree, because this was the only thing in it asking for
   the param. So the invitation card, itinerary, RSVP, registry and footer
   never made it into the server-rendered HTML; every guest waited on a full
   client hydration (and then a cold Vercel image-optimizer transform) before
   any of it appeared. Scoping Suspense to just these two variant-dependent
   fragments lets everything else — including the two Images above — render
   and get requested immediately. getInviteVariant(null) (== FULL) is what
   guests without those params see anyway, so it doubles as a fallback with no
   layout shift; only guests on a variant link see a near-instant swap
   post-hydration. */
const DEFAULT_VARIANT = getInviteVariant(null);

function DetailLines({ revealed }: { revealed: boolean }) {
  const variant = useInviteVariant();
  return <DetailLinesFallback revealed={revealed} timeLabel={variant.timeLabel} />;
}

function DetailLinesFallback({ revealed, timeLabel = DEFAULT_VARIANT.timeLabel }: { revealed: boolean; timeLabel?: string }) {
  return (
    <div className={styles.details} style={fadeUp(revealed, '0.6s')}>
      {detailLines(timeLabel).map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

function AddToCalendarButton({ revealed }: { revealed: boolean }) {
  const variant = useInviteVariant();
  return <AddToCalendarButtonFallback revealed={revealed} calendarDates={variant.calendarDates} />;
}

function AddToCalendarButtonFallback({ revealed, calendarDates = DEFAULT_VARIANT.calendarDates }: { revealed: boolean; calendarDates?: string }) {
  return (
    <PillButton as="a" href={calendarUrl(calendarDates)} target="_blank" rel="noopener noreferrer" variant="brown" icon={<FontAwesomeIcon icon={faCalendarPlus} />} style={pill(revealed, 2)}>
      Add to Calendar
    </PillButton>
  );
}

/* Snow is a canvas effect that only exists below the fold, behind the reveal.
   Statically imported it rode in the initial bundle for every guest, including
   the ones who never tap the button. ssr:false because it draws to a canvas and
   has nothing to render on the server. */
const Snowfall = dynamic(() => import('react-snowfall'), { ssr: false });

const WAZE_URL = 'https://waze.com/ul/hw282984j5';
const MAPS_URL = 'https://maps.app.goo.gl/hrAxPHoTWdKjrtNJ6';
const calendarUrl = (dates: string) =>
  'https://www.google.com/calendar/render?action=TEMPLATE' +
  '&text=The+Wedding+of+Anis+%26+Zafran' +
  `&dates=${dates}` +
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

/** The time line comes from the ?p= / ?t= variant — see lib/invite-variant.ts */
const detailLines = (timeLabel: string) => [
  'Sabtu, 31 Oktober 2026',
  timeLabel,
  'Grand Ballroom,',
  'BoraOmbak Putrajaya',
];

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

function pill(revealed: boolean, i: number): CSSProperties {
  return {
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 0.5s var(--ease) ${0.3 + i * 0.12}s, transform 0.5s var(--ease) ${0.3 + i * 0.12}s`,
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

  return (
    <section className={styles.section}>
      <div className={styles.bg}>
        {/* priority: this is what the reveal has to paint instantly. At 143KB
            (it was a 4.2MB PNG) it no longer starves the hero's LCP image. */}
        <Image
          src={bgInvitation}
          alt=""
          fill
          sizes="100vw"
          priority
          placeholder="blur"
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
        {/* No priority — it sits on top of the background above and arrives a
            beat later either way; competing for the hero's bandwidth on first
            paint cost more than it bought. */}
        <Image
          src={cardBlank}
          alt=""
          fill
          sizes="(max-width: 767px) 92vw, 60vh"
          className={styles.cardArt}
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

          <Suspense fallback={<DetailLinesFallback revealed={revealed} />}>
            <DetailLines revealed={revealed} />
          </Suspense>
        </div>
      </div>

      <div className={styles.ctaWrap}>
        <div className={styles.ctaGrid}>
          <PillButton as="a" href={WAZE_URL} target="_blank" rel="noopener noreferrer" variant="brown" icon={<FontAwesomeIcon icon={faWaze} />} style={pill(revealed, 0)}>
            Waze
          </PillButton>
          <PillButton as="a" href={MAPS_URL} target="_blank" rel="noopener noreferrer" variant="brown" icon={<FontAwesomeIcon icon={faLocationDot} />} style={pill(revealed, 1)}>
            Google Maps
          </PillButton>
          {/* Spans both columns on the mobile grid — see .ctaGrid */}
          <Suspense fallback={<AddToCalendarButtonFallback revealed={revealed} />}>
            <AddToCalendarButton revealed={revealed} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
