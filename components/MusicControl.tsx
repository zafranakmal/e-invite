'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import styles from './MusicControl.module.css';
import footerLogo from '@/assets/el-footer-logo.webp';

/* 96 kbps mono — background music played under a UI through a phone speaker,
   where stereo imaging and hi-fi headroom buy nothing. The bitrate is in the
   filename because /static/* is served `immutable` for a year (next.config.js),
   so a new encode has to arrive under a new name or cached clients keep the old
   one forever.

   Riyandi Kusuma's piano cover. The panel credits it as "piano cover" rather
   than naming him because .meta clips at 8.5rem on mobile with no ellipsis, and
   the full attribution would be cut mid-word. */
const TRACK_SRC = '/static/endless-love-96k.mp3';
const TRACK_TITLE = 'Endless Love';
const TRACK_ARTIST = 'Lionel Richie · piano cover';

/* Loud enough to carry, quiet enough not to startle anyone opening this in
   public. This pairs with the track and must be recalculated whenever the track
   changes — scripts/encode-track.sh prints the value to use, and the two are
   meant to be changed in the same commit.

   Do not re-tune it by ear. It is derived: the first track sat at -15.9 LUFS
   and was hand-tuned to 0.6, so the target is -20.34 LUFS actually reaching the
   guest, and VOLUME = 10^((-20.34 - I) / 20) for a track measuring I. This one
   ships at -16.3 LUFS, hence 0.63. */
const VOLUME = 0.63;

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
