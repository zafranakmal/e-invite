'use client';

import Image from 'next/image';

interface HeroSectionProps {
  onReveal: () => void;
  revealed: boolean;
}

export default function HeroSection({ onReveal, revealed }: HeroSectionProps) {
  return (
    <section className="hero-section">
      {/* Background image */}
      <div className="bg-wrap">
        <Image
          src="/bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
      </div>

      {/* Logo + button grouped so offset moves them together */}
      <div className="content-group">
        <div className="logo-wrap">
          <Image
            src="/logo-new.png"
            alt="Welcome — Anis & Zafran"
            width={860}
            height={650}
            priority
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* CTA — fades out once clicked */}
        <button
          onClick={onReveal}
          disabled={revealed}
          className={`reveal-btn${revealed ? ' revealed' : ''}`}
          aria-label="Reveal invitation"
        >
          <em>Join us in our celebration of love!</em>
        </button>
      </div>

      <style jsx>{`
        .hero-section {
          position: relative;
          height: 100vh;
          height: 100svh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          overflow: hidden;
          box-sizing: border-box;
        }

        .bg-wrap {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .content-group {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .logo-wrap {
          width: min(400px, 80vw);
        }

        /* Base button */
        .reveal-btn {
          background: #745a44;
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
          background: #997d51;
          transform: scale(1.03);
        }

        /* Fade out when invitation is revealed */
        .reveal-btn.revealed {
          opacity: 0;
          pointer-events: none;
          cursor: default;
        }

        /* PC / large screens */
        @media (min-width: 1024px) {
          .logo-wrap {
            width: min(700px, 55vw);
          }

          .reveal-btn {
            padding: 0.9rem 2rem;
            font-size: 1.1rem;
          }
        }

        /* Short viewports — e.g. ThinkPad at 150% scaling (~720px CSS height) */
        @media (max-height: 800px) {
          .logo-wrap {
            width: min(380px, 52vh);
          }

          .content-group {
            gap: 1rem;
          }
        }
      `}</style>
    </section>
  );
}
