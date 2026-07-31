'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface HeroSectionProps {
  onReveal: () => void;
  revealed: boolean;
}

export default function HeroSection({ onReveal, revealed }: HeroSectionProps) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let rafId: number;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section className="hero-section">
      {/* Background image with scroll parallax */}
      <div className="bg-wrap" style={{ transform: `translateY(${scrollY * -0.25}px)` }}>
        <Image
          src="/hero-sunflower-field.png"
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
            src="/wedding-lockup.png"
            alt="The Wedding of Anis and Zafran"
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
          top: 0;
          left: 0;
          right: 0;
          height: 120%;
          z-index: 0;
          will-change: transform;
        }

        .content-group {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        /* Elementor sizes the lockup as a % of the viewport-wide section:
           72% at tablet-and-below, 33% on desktop. Capped at the image's
           intrinsic 860px so it never upscales. */
        .logo-wrap {
          width: min(72vw, 860px);
          filter: drop-shadow(0 2px 10px rgba(0, 0, 0, 0.15));
        }

        /* Base button */
        .reveal-btn {
          background: #745a44;
          color: #fff;
          border: none;
          border-radius: var(--r-pill);
          padding: 0.85rem 2.5rem;
          font-family: var(--font-body);
          font-size: 1.1rem;
          cursor: pointer;
          letter-spacing: 0.02em;
          opacity: 1;
          min-height: 44px;
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

        /* Desktop — above Elementor's 1024px tablet breakpoint */
        @media (min-width: 1025px) {
          .logo-wrap {
            width: min(33vw, 860px);
          }

          .reveal-btn {
            padding: 0.9rem 2rem;
            font-size: 1.1rem;
          }
        }

        /* Short viewports — e.g. ThinkPad at 150% scaling (~720px CSS height) */
        @media (max-height: 800px) {
          .logo-wrap {
            width: min(72vw, 52vh);
          }

          .content-group {
            gap: 1rem;
          }
        }
      `}</style>
    </section>
  );
}
