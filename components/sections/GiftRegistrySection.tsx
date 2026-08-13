'use client';

import { CSSProperties } from 'react';
import Image from 'next/image';
import styles from './GiftRegistrySection.module.css';
import PillButton from '../design/PillButton';
import { useInviteVariant } from '../../lib/invite-variant';

/* Elementor #16251f9 — the export separates the two sentences with a
   <p>&nbsp;</p> spacer; that becomes a gap here rather than a blank line. */
const INTRO = [
  'Your presence at our wedding is the greatest gift of all.',
  'However, for those who wish to contribute to our wedding, we warmly welcome your kindness.',
];

/* Elementor #9139ded */
const TRANSFER = [
  'You may also transfer directly',
  'Bank Islam | 0506 7021 3143 22',
  'Anis Sufea Binti Ismail',
];

const CONTACT_GROUPS = [
  {
    side: 'Bride’s Side',
    people: [
      // Elementor #142b9c9 — no number on the source button, link left as exported
      { name: 'Ismail (Father)', href: 'https://wasap.my/' },
      { name: "Nora (Mother)", href: 'https://wasap.my/60196650855' },
    ],
  },
  {
    side: 'Groom’s Side',
    people: [
      { name: 'Zainol (Father)', href: 'https://wasap.my/60123159674' },
      { name: 'Zahariyah (Mother)', href: 'https://wasap.my/60123159374' },
    ],
  },
];

const ArrowIcon = () => (
  <svg viewBox="0 0 448 512" width="15" height="15" fill="currentColor" aria-hidden="true">
    <path d="M313.941 216H12c-6.627 0-12 5.373-12 12v56c0 6.627 5.373 12 12 12h301.941v46.059c0 21.382 25.851 32.09 40.971 16.971l86.059-86.059c9.373-9.373 9.373-24.569 0-33.941l-86.059-86.059c-15.119-15.119-40.971-4.411-40.971 16.971V216z" />
  </svg>
);

interface GiftRegistrySectionProps {
  style?: CSSProperties;
}

export default function GiftRegistrySection({ style }: GiftRegistrySectionProps) {
  // ?p=v1 drops the registry card and its button; the Further Questions card
  // below is not part of the registry and stays on every variant.
  const { showRegistry } = useInviteVariant();

  return (
    <section id="gift" className={styles.section}>
      {showRegistry && (
        <>
          <div className={styles.row} style={style}>
            <div className={styles.registryCard}>
              <Image
                src="/el-registry-card.png"
                alt=""
                fill
                sizes="(max-width: 767px) 92vw, (max-width: 1024px) 78vw, 38vw"
                className={styles.registryArt}
              />

              <div className={styles.registryType}>
                {/* Elementor #007eb4a — Pinyon Script 3.2em, #583701 */}
                <h2 className={styles.registryHeading}>Gift Registry</h2>

                <div className={styles.registryCopy}>
                  {INTRO.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>

                {/* Elementor #22743bb — a two-column grid, QR beside the details */}
                <div className={styles.pay}>
                  <Image
                    src="/anis-qr.png"
                    alt="DuitNow QR code for Bank Islam 0506 7021 3143 22"
                    width={1200}
                    height={1200}
                    className={styles.qr}
                    sizes="(max-width: 767px) 25vw, (max-width: 1024px) 21vw, 11vw"
                  />

                  <div className={styles.bank}>
                    {TRANSFER.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.row}>
            {/* Elementor sets flex-direction: row-reverse on this button — arrow trails the label */}
            <PillButton as="a" href="/registry" variant="brown">
              View our Registry <ArrowIcon />
            </PillButton>
          </div>
        </>
      )}

      <div className={styles.questions}>
        <Image
          src="/el-questions-card.png"
          alt=""
          fill
          sizes="(max-width: 767px) 92vw, (max-width: 1024px) 78vw, 38vw"
          className={styles.questionsArt}
        />

        <div className={styles.questionsType}>
          <h2 className={styles.questionsHeading}>Further Questions:</h2>
          <p className={styles.questionsSub}>Contact us directly or our family members:</p>

          {CONTACT_GROUPS.map((group) => (
            <div key={group.side} className={styles.contactGroup}>
              <h3 className={styles.sideLabel}>{group.side}</h3>
              {group.people.map((person) => (
                <a
                  key={person.name}
                  className={styles.contactBtn}
                  href={person.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {person.name}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
