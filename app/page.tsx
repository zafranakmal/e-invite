'use client';

import { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import InvitationContent from '../components/InvitationContent';
import BottomNav from '../components/BottomNav';

export default function Home() {
  const [revealed, setRevealed] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    // Prevent browser from restoring previous scroll position on reload
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // Wait for fonts before showing content
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  // Lock scroll until the invitation is revealed
  useEffect(() => {
    document.body.style.overflow = revealed ? '' : 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [revealed]);

  const handleReveal = () => {
    setRevealed(true);
    setTimeout(() => {
      document.getElementById('invitation')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <>
      {/* Loading overlay — fades out once fonts are ready */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#e1d3c6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          opacity: fontsReady ? 0 : 1,
          pointerEvents: fontsReady ? 'none' : 'auto',
          transition: 'opacity 0.8s ease',
        }}
      >
        <p
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(1rem, 4vw, 1.4rem)',
            letterSpacing: '0.3em',
            color: '#3d3028',
            fontStyle: 'italic',
          }}
        >
          A &amp; Z
        </p>
      </div>

      <main style={{ paddingBottom: revealed ? '64px' : 0 }}>
        <HeroSection onReveal={handleReveal} revealed={revealed} />
        <InvitationContent revealed={revealed} />
      </main>
      <BottomNav visible={revealed} />
    </>
  );
}
