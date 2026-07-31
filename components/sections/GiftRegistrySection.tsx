'use client';

import { CSSProperties } from 'react';
import Image from 'next/image';
import styles from './GiftRegistrySection.module.css';
import PillButton from '../design/PillButton';

const CONTACTS = [
  { label: 'Aufa (Sister of the Bride)', href: 'https://wasap.my/60129599423' },
  { label: 'Iqmal (Brother of the Groom)', href: 'https://wasap.my/60129599423' },
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
  return (
    <section id="gift" className={styles.section}>
      <div className={styles.bg}>
        <Image src="/el-bg-registry.jpg" alt="" fill sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'left top' }} />
      </div>

      <div className={styles.row} style={style}>
        <Image
          src="/el-gift-registry.png"
          alt="Gift Registry — your presence at our wedding is the greatest gift of all. For those who wish to contribute, you may transfer directly to Bank Islam 05067021314322, Anis Sufea Binti Ismail."
          width={746}
          height={570}
          className={styles.registryCard}
          sizes="(max-width: 1024px) 100vw, 41vw"
        />
      </div>

      <div className={styles.row}>
        {/* Elementor sets flex-direction: row-reverse on this button — arrow trails the label */}
        <PillButton as="a" href="/registry" variant="brown">
          View our Registry <ArrowIcon />
        </PillButton>
      </div>

      <div className={styles.questions}>
        <Image
          src="/el-questions-card.png"
          alt=""
          fill
          sizes="(max-width: 767px) 96vw, (max-width: 1024px) 70vw, 30vw"
          className={styles.questionsArt}
        />

        <div className={styles.questionsType}>
          <h2 className={styles.questionsHeading}>Have any questions?</h2>
          <p className={styles.questionsSub}>Contact us directly or our family members:</p>
          <div className={styles.contactList}>
            {CONTACTS.map((c) => (
              <a key={c.label} className={styles.contactBtn} href={c.href} target="_blank" rel="noopener noreferrer">
                {c.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.row}>
        <Image
          src="/el-thankyou-heart.png"
          alt="From the bottom of our hearts — thank you for being a part of our special day. We appreciate all the love and support that we receive from our loved ones, be it near or far. We are so grateful for your attendance, kind wishes and prayers. With love, Anis and Zafran."
          width={660}
          height={576}
          className={styles.heart}
          sizes="(max-width: 1024px) 100vw, 41vw"
        />
      </div>
    </section>
  );
}
