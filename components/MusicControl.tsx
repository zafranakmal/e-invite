'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import styles from './MusicControl.module.css';
import footerLogo from '@/assets/el-footer-logo.webp';

/* 96 kbps mono, 2.8MB — the source was 192 kbps stereo, 5.9MB. This is
   background music played under a UI through a phone speaker; stereo imaging
   and hi-fi headroom were buying nothing. The bitrate is in the filename
   because /static/* is served `immutable` for a year (next.config.js) — a
   re-encode has to arrive under a new name or cached clients keep the old one.

   Riyandi Kusuma's piano cover, credited as "piano cover" in the panel because
   .meta clips at 8.5rem on mobile and the full attribution doesn't fit. */
const TRACK_SRC = '/static/home-piano-96k.mp3';
const TRACK_TITLE = 'Home';
const TRACK_ARTIST = 'Michael Bublé · piano cover';

/* Loud enough to carry, quiet enough not to startle anyone opening this in
   public. 0.78, not the 0.6 this was tuned to, because the track changed
   underneath it: the piano cover masters at -18.2 LUFS against the previous
   track's -15.9, and +2.3dB of gain is exactly that difference. Applied here
   rather than baked into the file — loudnorm could only reach -18.2 without
   either clipping the true peak or compressing the dynamics, and a solo piano
   recording is mostly dynamics. Re-measure if the track is ever swapped again:
   ffmpeg -i <file> -af ebur128 -f null - */
const VOLUME = 0.78;

export interface MusicControlHandle {
  /** Start playback. Must be called from within a user gesture — see page.tsx. */
  play: () => void;
}

interface MusicControlProps {
  /** Matches BottomNav: the control rides above the bar, so it appears with it. */
  visible: boolean;
}

const MusicControl = forwardRef<MusicControlHandle, MusicControlProps>(function MusicControl({ visible }, ref) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Track the element's real state rather than assuming play() succeeded — the
  // browser can refuse, and playback can also end or stall on its own.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = VOLUME;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onPause);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onPause);
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      // A rejected promise just means the browser declined autoplay; the guest
      // can still start it from the disc, so there's nothing to report.
      play: () => void audioRef.current?.play().catch(() => {}),
    }),
    []
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play().catch(() => {});
    else audio.pause();
  }, []);

  return (
    <div className={`${styles.wrap}${visible ? ' ' + styles.visible : ''}`}>
      <div className={`${styles.panel}${expanded ? ' ' + styles.panelOpen : ''}`}>
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Hide track details' : 'Show track details'}
          tabIndex={visible ? 0 : -1}
        >
          <FontAwesomeIcon icon={expanded ? faChevronRight : faChevronLeft} />
        </button>

        <div className={styles.meta} aria-hidden={!expanded}>
          <span className={styles.title}>{TRACK_TITLE}</span>
          <span className={styles.artist}>{TRACK_ARTIST}</span>
        </div>

        <button
          type="button"
          className={styles.discBtn}
          onClick={toggle}
          aria-pressed={playing}
          aria-label={playing ? 'Pause music' : 'Play music'}
          tabIndex={visible ? 0 : -1}
        >
          {/* No spindle hole — at this size it lands straight on the monogram
              and swallows it. Grooves plus the label read as vinyl on their own. */}
          <span className={`${styles.disc}${playing ? ' ' + styles.spinning : ''}`}>
            <span className={styles.discLabel}>
              <Image src={footerLogo} alt="" sizes="32px" />
            </span>
          </span>
        </button>
      </div>

      {/* preload="none" — the track shouldn't compete with the invitation's
          artwork for bandwidth before anyone has asked to hear it. */}
      <audio ref={audioRef} src={TRACK_SRC} loop preload="none" />
    </div>
  );
});

export default MusicControl;
