'use client';

//added "use client" directive to ensure this component is rendered on the client side, as it uses hooks and browser APIs

import { useState, useEffect, useRef } from 'react';
import HeroSection from '../components/HeroSection';
import InvitationContent from '../components/InvitationContent';
import BottomNav from '../components/BottomNav';
import MusicControl, { MusicControlHandle } from '../components/MusicControl';
import { Suspense } from 'react';

export default function Home() {
  const [revealed, setRevealed] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const musicRef = useRef<MusicControlHandle>(null);

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
    // Kicked off synchronously here, inside the click's gesture, rather than
    // from an effect on `revealed` — iOS Safari is strict about audio starting
    // in the same task as the interaction that asked for it.
    musicRef.current?.play();
    setRevealed(true);
    setTimeout(() => {
      // offsetTop (layout position) rather than scrollIntoView/getBoundingClientRect
      // (painted position) -- the section is still mid-way through its
      // reveal transform at this point, and only offsetTop ignores that.
      const el = document.getElementById('invitation');
      if (el) window.scrollTo({ top: el.offsetTop, behavior: 'smooth' });
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

      {/* No bottom padding here — it painted a strip of body background between
          the footer and the fixed nav. SiteFooter reserves that space itself so
          its own dark surface runs behind the nav. */}
      <main>
        <HeroSection onReveal={handleReveal} revealed={revealed} />
        <Suspense fallback={null}>
          <InvitationContent revealed={revealed} />
        </Suspense>
      </main>
      {/* Always mounted so the <audio> element exists when handleReveal fires;
          the control itself stays hidden until `visible`. */}
      <MusicControl ref={musicRef} visible={revealed} />
      <BottomNav visible={revealed} />
    </>
  );
}
