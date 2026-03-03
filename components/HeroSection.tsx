'use client';

interface HeroSectionProps {
  onReveal: () => void;
  revealed: boolean;
}

export default function HeroSection({ onReveal, revealed }: HeroSectionProps) {
  return (
    <section className="hero-section">
      {/* Arched text */}
      <div className="arch-container">
        <svg viewBox="0 0 500 200" className="arch-svg">
          <defs>
            <path id="archPath" d="M 30,180 A 220,220 0 0,1 470,180" />
          </defs>
          <text className="arch-text" letterSpacing="8">
            <textPath href="#archPath" startOffset="50%" textAnchor="middle">
              WELCOME TO OUR FOREVER CHAPTER
            </textPath>
          </text>
        </svg>
      </div>

      {/* Couple names */}
      <div className="names-container">
        <h1 className="couple-names">
          <span className="name-left">Anis</span>
          <span className="ampersand">&amp;</span>
          <span className="name-right">Zafran</span>
        </h1>
      </div>

      {/* Date */}
      <p className="wedding-date">31 OCTOBER 2026</p>

      {/* CTA — fades out once clicked */}
      <button
        onClick={onReveal}
        disabled={revealed}
        className={`reveal-btn${revealed ? ' revealed' : ''}`}
        aria-label="Reveal invitation"
      >
        <em>Join us in our celebration of love!</em>
      </button>

      <style jsx>{`
        .hero-section {
          min-height: 100svh;
          width: 100%;
          background: #e1d3c6ff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .arch-container {
          width: min(700px, 90vw);
          margin-bottom: -8rem;
        }

        .arch-svg {
          width: 100%;
          overflow: visible;
        }

        .arch-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 14px;
          fill: #2c2c2c;
          font-weight: 400;
        }

        .names-container {
          text-align: center;
          margin: 0.5rem 0;
        }

        .couple-names {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.8rem, 10vw, 9rem);
          font-weight: 400;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          gap: 0.25em;
          line-height: 1;
          margin: 0;
        }

        .name-left,
        .name-right {
          font-style: italic;
        }

        .ampersand {
          font-style: normal;
          font-size: 1.2em;
          font-weight: 300;
          color: #2c2c2c;
        }

        .wedding-date {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(0.75rem, 1.4vw, 1.1rem);
          letter-spacing: 0.35em;
          color: #2c2c2c;
          margin: 1.5rem 0 2.5rem;
          font-weight: 500;
        }

        /* Base button */
        .reveal-btn {
          background: #8faa6e;
          color: #ffffff;
          border: none;
          border-radius: 50px;
          padding: 0.85rem 2.5rem;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem;
          cursor: pointer;
          letter-spacing: 0.02em;
          opacity: 1;
          transition:
            background 0.3s ease,
            transform 0.2s ease,
            opacity 0.65s ease;
        }

        .reveal-btn:hover:not(:disabled) {
          background: #7a9660;
          transform: scale(1.03);
        }

        /* Fade out when invitation is revealed */
        .reveal-btn.revealed {
          opacity: 0;
          pointer-events: none;
          cursor: default;
        }
      `}</style>
    </section>
  );
}
