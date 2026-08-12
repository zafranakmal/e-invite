import Image from 'next/image';
import styles from './ThankYouSection.module.css';

/* Elementor #2a6235f — the export keeps these as three <p>s separated by
   <p><br></p> spacers. "your attendance" is corrected from the export's
   "you attendance". */
const NOTE = [
  'Thank you for being part of our special day.',
  'We appreciate all the love and support that we receive from our loved ones, be it near or far.',
  'We are so grateful for your attendance, kind wishes and prayers.',
];

export default function ThankYouSection() {
  return (
    <section className={styles.section}>
      <div className={styles.heart}>
        <Image
          src="/el-thankyou-heart.png"
          alt=""
          fill
          sizes="(max-width: 767px) 95vw, (max-width: 1024px) 78vw, 38vw"
          className={styles.heartArt}
        />

        <div className={styles.type}>
          {/* Elementor #46765f7 — Pinyon Script 2.5em, #583701 */}
          <h2 className={styles.heading}>From the bottom of our hearts,</h2>

          <div className={styles.note}>
            {NOTE.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          {/* Elementor #9a4693e */}
          <p className={styles.signOff}>With love,</p>
          {/* Elementor #69b2791 — Pinyon Script 2.3em, #583701 */}
          <p className={styles.signature}>Anis &amp; Zafran</p>
        </div>
      </div>
    </section>
  );
}
