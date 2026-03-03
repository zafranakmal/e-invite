'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './InvitationContent.module.css';

const RELATION_OPTIONS = [
  'Core Families',
  'Families',
  'Friends',
  'Colleagues',
  'Wedding Connections',
];

type Wish = { id: string; name: string; message: string };

interface InvitationContentProps {
  revealed: boolean;
}

export default function InvitationContent({ revealed }: InvitationContentProps) {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') ?? '';

  const [wishes, setWishes] = useState<Wish[]>([]);

  useEffect(() => {
    fetch('/api/wishes')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setWishes(data); })
      .catch(() => {});
  }, []);

  const [rsvpData, setRsvpData] = useState({
    name: '',
    mobile: '',
    attending: '',
    pax: '',
    relation: '',
    wish: '',
    _hp: '',
  });
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpError, setRsvpError] = useState('');
  const [checkMobile, setCheckMobile] = useState('');
  const [checkResult, setCheckResult] = useState<{ name: string; attending: boolean; guests: number } | 'not-found' | null>(null);
  const [checkLoading, setCheckLoading] = useState(false);
  const wishScrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wishScrollerRef.current;
    if (!el) return;

    let rafId: number;
    let paused = false;
    let resumeTimer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (!paused) {
        el.scrollTop += 0.5;
        if (el.scrollTop >= el.scrollHeight / 2) {
          el.scrollTop = 0;
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    const onInteract = () => {
      paused = true;
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => { paused = false; }, 2500);
    };

    el.addEventListener('wheel', onInteract, { passive: true });
    el.addEventListener('touchstart', onInteract, { passive: true });
    el.addEventListener('touchmove', onInteract, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(resumeTimer);
      el.removeEventListener('wheel', onInteract);
      el.removeEventListener('touchstart', onInteract);
      el.removeEventListener('touchmove', onInteract);
    };
  }, []);

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Honeypot: if filled, silently fake success without hitting the API
    if (rsvpData._hp) {
      setRsvpSubmitted(true);
      return;
    }
    setRsvpSubmitting(true);
    setRsvpError('');
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: rsvpData.name,
          mobile: rsvpData.mobile,
          attending: rsvpData.attending === 'yes',
          guests: rsvpData.pax ? parseInt(rsvpData.pax) : 1,
          ref: ref || null,
          relation: rsvpData.relation || null,
          _hp: rsvpData._hp,
        }),
      });
      if (!res.ok) throw new Error();

      if (rsvpData.wish.trim()) {
        await fetch('/api/wishes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: rsvpData.name, message: rsvpData.wish }),
        });
      }

      setRsvpSubmitted(true);
    } catch {
      setRsvpError('Something went wrong. Please try again.');
    } finally {
      setRsvpSubmitting(false);
    }
  };

  const handleCheckRsvp = async () => {
    if (!checkMobile.trim()) return;
    setCheckLoading(true);
    try {
      const res = await fetch(`/api/rsvp?mobile=${encodeURIComponent(checkMobile.trim())}`);
      const data = await res.json();
      if (data && data.id) {
        setCheckResult({ name: data.name, attending: data.attending, guests: data.guests });
      } else {
        setCheckResult('not-found');
      }
    } catch {
      setCheckResult('not-found');
    } finally {
      setCheckLoading(false);
    }
  };

  const wazeUrl = 'https://waze.com/ul/hw282984jm';
  const googleMapsUrl = 'https://maps.app.goo.gl/hrAxPHoTWdKjrtNJ6';
  const calendarUrl =
    'https://www.google.com/calendar/render?action=TEMPLATE' +
    '&text=Anis+%26+Zafran+Wedding' +
    '&dates=20261031T190000/20261031T230000' +
    '&details=Walimatul+Urus' +
    '&location=Grand+Ballroom,+BoraOmbak+Marina+Putrajaya';

  return (
    <section
      id="invitation"
      className={`${styles.invitationSection}${revealed ? ' ' + styles.visible : ''}`}
    >
      {/* ── Screen 1: Monogram + Names + CTA ── */}
      <div className={styles.screenSection}>
        {/* ── Monogram header ── */}
        <div className={styles.monoHeader}>
          <p className={styles.walimatul}>W A L I M A T U L &nbsp; U R U S</p>
          <div className={styles.monogram}>
            <span className={styles.monoA}>A</span>
            <span className={styles.monoZ}>Z</span>
          </div>
          <p className={styles.detailLine}>31 OCTOBER 2026</p>
          <p className={styles.detailLine}>GRAND BALLROOM</p>
          <p className={styles.detailLine}>BORAOMBAK MARINA PUTRAJAYA</p>
        </div>

        {/* ── Bismillah ── */}
        <p className={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</p>

        {/* ── Parents & couple names ── */}
        <div className={styles.namesBlock}>
          <p className={styles.parentName}>ISMAIL BIN TAWNIE</p>
          <p className={styles.parentName}>NOR RABA&apos;AH BINTI ZAKARIA</p>
          <p className={styles.andConnector}>and</p>
          <p className={styles.parentName}>ZAINOL HISHAM BIN OSMAN</p>
          <p className={styles.parentName}>ZAHARIAH BINTI YEOP</p>
          <p className={styles.inviteText}>joyfully invite you to the reception of our beloved children</p>
          <p className={styles.scriptName}>Anis Sufea binti Ismail</p>
          <p className={styles.andConnector}>and</p>
          <p className={styles.scriptName}>Zafran Akmal bin Zainol Hisham</p>
          <p className={styles.eventDate}>31 October 2026</p>
          <p className={styles.eventTime}>7.00 PM – 11.00 PM</p>
        </div>

        {/* ── CTA buttons ── */}
        <div className={styles.ctaRow}>
          <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className={styles.btnLocation}>
            <svg viewBox="0 0 32 32" width="18" height="18" fill="none">
              <path d="M16 3C9.9 3 5 7.7 5 13.5c0 4.8 3.1 8.9 7.5 10.5L11 29l5-3.5 5 3.5-1.5-5C24 21.9 27 17.5 27 13.5 27 7.7 22.1 3 16 3z" fill="#00d5d6"/>
              <circle cx="12.5" cy="13" r="1.8" fill="white"/>
              <circle cx="19.5" cy="13" r="1.8" fill="white"/>
              <path d="M12 18c1.5 2.5 7 2.5 8 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            </svg>
            Waze
          </a>
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className={styles.btnLocation}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <path d="M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7z" fill="#EA4335"/>
              <circle cx="12" cy="9" r="2.5" fill="white"/>
            </svg>
            Google Maps
          </a>
          <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className={styles.btnDark}>
            Add to Calendar
          </a>
        </div>
      </div>

      <div className={styles.divider} />

      {/* ── Screen 2: Itinerary ── */}
      <div id="itinerary" className={styles.screenSection}>
        <div className={styles.itineraryWrap}>
          <div className={styles.itineraryLeft}>
            <h2 className={styles.itineraryTitle}>
              Reception<br />Itinerary
            </h2>
            <div className={styles.illustration}>
              <svg viewBox="10 78 220 150" fill="none" width="100%">
                {/* Tablecloth drape */}
                <path d="M 25,145 Q 15,172 18,202 Q 120,220 222,202 Q 225,172 215,145" stroke="#3d3028" strokeWidth="1.3"/>
                {/* Table ellipse */}
                <ellipse cx="120" cy="135" rx="95" ry="42" stroke="#3d3028" strokeWidth="1.5"/>
                {/* Tablecloth sides */}
                <path d="M 25,135 L 18,202" stroke="#3d3028" strokeWidth="1.2"/>
                <path d="M 215,135 L 222,202" stroke="#3d3028" strokeWidth="1.2"/>
                {/* Left plate */}
                <ellipse cx="70" cy="144" rx="24" ry="13" stroke="#3d3028" strokeWidth="1.1"/>
                <ellipse cx="70" cy="144" rx="17" ry="9" stroke="#3d3028" strokeWidth="0.7"/>
                {/* Left fork */}
                <path d="M 41,137 L 38,153" stroke="#3d3028" strokeWidth="0.9"/>
                <path d="M 45,136 L 42,152" stroke="#3d3028" strokeWidth="0.9"/>
                {/* Left knife */}
                <path d="M 97,137 L 100,153" stroke="#3d3028" strokeWidth="0.9"/>
                {/* Right plate */}
                <ellipse cx="170" cy="144" rx="24" ry="13" stroke="#3d3028" strokeWidth="1.1"/>
                <ellipse cx="170" cy="144" rx="17" ry="9" stroke="#3d3028" strokeWidth="0.7"/>
                {/* Right fork */}
                <path d="M 141,137 L 138,153" stroke="#3d3028" strokeWidth="0.9"/>
                <path d="M 145,136 L 142,152" stroke="#3d3028" strokeWidth="0.9"/>
                {/* Right knife */}
                <path d="M 197,137 L 200,153" stroke="#3d3028" strokeWidth="0.9"/>
                <path d="M 201,136 L 204,152" stroke="#3d3028" strokeWidth="0.9"/>
                {/* Wine glass */}
                <path d="M 192,116 Q 196,127 192,131 L 194,140 M 189,140 L 197,140" stroke="#3d3028" strokeWidth="0.9"/>
                {/* Small water glass left */}
                <path d="M 50,121 L 47,133 Q 50,136 53,133 L 50,121" stroke="#3d3028" strokeWidth="0.8"/>
                {/* Napkin on left plate */}
                <rect x="62" y="139" width="10" height="7" rx="1" stroke="#3d3028" strokeWidth="0.7" transform="rotate(-8,67,142)"/>
                {/* Vase */}
                <path d="M 112,130 Q 108,136 109,142 L 131,142 Q 132,136 128,130 Z" stroke="#3d3028" strokeWidth="1.1"/>
                {/* Stems */}
                <line x1="120" y1="130" x2="120" y2="103" stroke="#3d3028" strokeWidth="0.9"/>
                <line x1="120" y1="130" x2="107" y2="96" stroke="#3d3028" strokeWidth="0.9"/>
                <line x1="120" y1="130" x2="133" y2="96" stroke="#3d3028" strokeWidth="0.9"/>
                <line x1="120" y1="130" x2="103" y2="110" stroke="#3d3028" strokeWidth="0.9"/>
                <line x1="120" y1="130" x2="137" y2="110" stroke="#3d3028" strokeWidth="0.9"/>
                {/* Centre flower */}
                <circle cx="120" cy="98" r="7" stroke="#3d3028" strokeWidth="1"/>
                <circle cx="120" cy="98" r="3" stroke="#3d3028" strokeWidth="0.7" fill="#3d3028"/>
                {/* Left flowers */}
                <circle cx="106" cy="91" r="6" stroke="#3d3028" strokeWidth="1"/>
                <circle cx="106" cy="91" r="2.5" fill="#3d3028"/>
                <circle cx="101" cy="106" r="5" stroke="#3d3028" strokeWidth="0.9"/>
                {/* Right flowers */}
                <circle cx="134" cy="91" r="6" stroke="#3d3028" strokeWidth="1"/>
                <circle cx="134" cy="91" r="2.5" fill="#3d3028"/>
                <circle cx="139" cy="106" r="5" stroke="#3d3028" strokeWidth="0.9"/>
                {/* Leaves */}
                <path d="M 112,120 Q 103,115 104,123 Q 112,124 112,120" stroke="#3d3028" strokeWidth="0.8"/>
                <path d="M 128,120 Q 137,115 136,123 Q 128,124 128,120" stroke="#3d3028" strokeWidth="0.8"/>
                <path d="M 109,110 Q 100,106 101,113" stroke="#3d3028" strokeWidth="0.8"/>
                <path d="M 131,110 Q 140,106 139,113" stroke="#3d3028" strokeWidth="0.8"/>
              </svg>
            </div>
          </div>
          <div className={styles.itineraryRight}>
            {[
              { time: '7.00 PM', event: 'Arrival of guests' },
              { time: '8.00 PM', event: 'Arrival of bride & groom' },
              { time: '9.30 PM', event: 'Photography Session' },
              { time: '11.00 PM', event: 'End of reception' },
            ].map((item) => (
              <div key={item.time} className={styles.itinRow}>
                <span className={styles.itinTime}>{item.time}</span>
                <span className={styles.itinEvent}>{item.event}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      {/* ── Screen 3: RSVP ── */}
      <div id="rsvp" className={styles.screenSection}>
        <div className={styles.rsvpSection}>
          <h2 className={styles.rsvpTitle}>Save your seat!</h2>
          <div className={styles.illustrationRsvp}>
            <svg viewBox="0 0 90 90" fill="none" width="75">
              <circle cx="45" cy="28" r="8" stroke="#3d3028" strokeWidth="1.2" />
              <circle cx="30" cy="20" r="6" stroke="#3d3028" strokeWidth="1.1" />
              <circle cx="60" cy="20" r="6" stroke="#3d3028" strokeWidth="1.1" />
              <circle cx="35" cy="38" r="5" stroke="#3d3028" strokeWidth="1" />
              <circle cx="55" cy="38" r="5" stroke="#3d3028" strokeWidth="1" />
              <circle cx="45" cy="44" r="4" stroke="#3d3028" strokeWidth="1" />
              <line x1="45" y1="58" x2="45" y2="78" stroke="#3d3028" strokeWidth="1.5" />
              <path d="M35 70 Q45 64 55 70" stroke="#3d3028" strokeWidth="1" />
              <path d="M38 62 Q45 58 52 62 M38 62 Q32 66 38 70 M52 62 Q58 66 52 70" stroke="#3d3028" strokeWidth="1" />
            </svg>
          </div>

          {rsvpSubmitted ? (
            <div className={styles.rsvpSuccess}>
              <p>Thank you, <em>{rsvpData.name}</em>! We look forward to seeing you.</p>
            </div>
          ) : (
            <form onSubmit={handleRsvpSubmit} className={styles.rsvpForm}>
              <div className={styles.formRow}>
                <label htmlFor="rsvp-name">Name:</label>
                <input
                  id="rsvp-name"
                  type="text"
                  value={rsvpData.name}
                  onChange={(e) => setRsvpData({ ...rsvpData, name: e.target.value })}
                  required
                  placeholder="Your name"
                />
              </div>
              <div className={styles.formRow}>
                <label htmlFor="rsvp-mobile">Mobile No.:</label>
                <input
                  id="rsvp-mobile"
                  type="tel"
                  value={rsvpData.mobile}
                  onChange={(e) => setRsvpData({ ...rsvpData, mobile: e.target.value })}
                  required
                  placeholder="e.g. 0123456789"
                />
              </div>
              <div className={styles.formRow}>
                <label htmlFor="rsvp-attending">Will you be attending?</label>
                <select
                  id="rsvp-attending"
                  value={rsvpData.attending}
                  onChange={(e) => setRsvpData({ ...rsvpData, attending: e.target.value })}
                  required
                >
                  <option value="">Select...</option>
                  <option value="yes">Yes, I will attend</option>
                  <option value="no">Sorry, I cannot attend</option>
                </select>
              </div>
              <div className={`${styles.formRow} ${styles.formRowTop}`}>
                <label htmlFor="rsvp-pax">
                  Number of pax:<br />
                  <span className={styles.labelNote}>(max. 2 pax per guest)</span>
                </label>
                <select
                  id="rsvp-pax"
                  value={rsvpData.pax}
                  onChange={(e) => setRsvpData({ ...rsvpData, pax: e.target.value })}
                >
                  <option value="">Select...</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>
              </div>
              <div className={styles.formRow}>
                <label htmlFor="rsvp-relation">Your relation to us:</label>
                <select
                  id="rsvp-relation"
                  value={rsvpData.relation}
                  onChange={(e) => setRsvpData({ ...rsvpData, relation: e.target.value })}
                >
                  <option value="">Select... (optional)</option>
                  {RELATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className={`${styles.formRow} ${styles.formRowTop}`}>
                <label htmlFor="rsvp-wish">Your wish:</label>
                <textarea
                  id="rsvp-wish"
                  value={rsvpData.wish}
                  onChange={(e) => setRsvpData({ ...rsvpData, wish: e.target.value })}
                  rows={4}
                  placeholder="Share your wishes..."
                />
              </div>
              {/* Honeypot — hidden from humans, bots will fill it */}
              <div className={styles.honeypot} aria-hidden="true">
                <label htmlFor="rsvp-website">Website</label>
                <input
                  id="rsvp-website"
                  type="text"
                  name="website"
                  value={rsvpData._hp}
                  onChange={(e) => setRsvpData({ ...rsvpData, _hp: e.target.value })}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              {rsvpError && <p className={styles.checkNotFound}>{rsvpError}</p>}
              <button type="submit" className={styles.submitBtn} disabled={rsvpSubmitting}>
                {rsvpSubmitting ? 'Sending…' : 'Send RSVP'}
              </button>
            </form>
          )}

          {/* ── Check RSVP ── */}
          <div className={styles.checkRsvp}>
            <p className={styles.checkTitle}>Already submitted? Check your RSVP.</p>
            <div className={styles.checkRow}>
              <input
                type="tel"
                inputMode="numeric"
                value={checkMobile}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  setCheckMobile(digits);
                  setCheckResult(null);
                }}
                placeholder="Enter your mobile no."
                className={styles.checkInput}
              />
              <button
                type="button"
                className={styles.checkBtn}
                onClick={handleCheckRsvp}
                disabled={checkLoading}
              >
                {checkLoading ? '…' : 'Check'}
              </button>
            </div>
            {checkResult && checkResult !== 'not-found' && (
              <div className={styles.checkSuccess}>
                <p>Your RSVP has been received.</p>
                {checkResult.attending ? (
                  <p>You are attending with <strong>{checkResult.guests}</strong> {checkResult.guests === 1 ? 'guest' : 'guests'}.</p>
                ) : (
                  <p>You have indicated that you will not be attending.</p>
                )}
              </div>
            )}
            {checkResult === 'not-found' && (
              <p className={styles.checkNotFound}>No RSVP found for this number.</p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      {/* ── Screen 4: Gift / DuitNow ── */}
      <div id="gift" className={styles.screenSection}>
        <div className={styles.giftSection}>
          <p className={styles.giftEyebrow}>A token of love</p>
          <h2 className={styles.giftTitle}>Your presence is our greatest gift.</h2>
          <p className={styles.giftDesc}>
            Should you wish to bless our new beginning, a heartfelt contribution is warmly welcomed.
          </p>

          {/* QR card */}
          <div className={styles.qrCard}>
            <p className={styles.qrCardLabel}>Scan to send via DuitNow</p>
            <div className={styles.qrFrame}>
              <svg viewBox="0 0 120 120" width="160" height="160">
                <rect x="5" y="5" width="50" height="50" rx="4" fill="none" stroke="#2c2218" strokeWidth="3" />
                <rect x="15" y="15" width="30" height="30" rx="2" fill="#2c2218" />
                <rect x="65" y="5" width="50" height="50" rx="4" fill="none" stroke="#2c2218" strokeWidth="3" />
                <rect x="75" y="15" width="30" height="30" rx="2" fill="#2c2218" />
                <rect x="5" y="65" width="50" height="50" rx="4" fill="none" stroke="#2c2218" strokeWidth="3" />
                <rect x="15" y="75" width="30" height="30" rx="2" fill="#2c2218" />
                <rect x="65" y="65" width="12" height="12" fill="#2c2218" />
                <rect x="82" y="65" width="12" height="12" fill="#2c2218" />
                <rect x="99" y="65" width="16" height="12" fill="#2c2218" />
                <rect x="65" y="82" width="12" height="12" fill="#2c2218" />
                <rect x="82" y="82" width="28" height="12" fill="#2c2218" />
                <rect x="65" y="99" width="28" height="16" fill="#2c2218" />
                <rect x="98" y="99" width="17" height="16" fill="#2c2218" />
              </svg>
            </div>
            <p className={styles.qrName}>Zafran Akmal bin Zainol Hisham</p>
          </div>

          {/* Bank transfer alternative */}
          <div className={styles.bankWrap}>
            <p className={styles.bankOr}>or transfer directly</p>
            <p className={styles.bankName}>Maybank &nbsp;·&nbsp; 1234 5678 9012</p>
            <p className={styles.bankHolder}>Zafran Akmal bin Zainol Hisham</p>
          </div>

          <a href="/registry" className={styles.btnRegistry}>View Gift Registry →</a>
        </div>
      </div>

      <div className={styles.divider} />

      {/* ── Screen 5: Warm wishes ── */}
      <div id="wishes" className={styles.screenSection}>
        <div className={styles.wishesSection}>
          <h2 className={styles.wishesTitle}>Warm Wishes</h2>
          <p className={styles.wishesSubtitle}>From our loved ones</p>
          <div className={styles.wishesContainer}>
            <div className={styles.wishesFadeTop} />
            <div className={styles.wishesFadeBottom} />
            <div className={styles.wishesScroller} ref={wishScrollerRef}>
              <div className={styles.wishesTrack}>
                {wishes.length === 0 ? (
                  <p className={styles.wishCardText} style={{ textAlign: 'center', padding: '2rem', fontStyle: 'italic', color: '#9a8070' }}>
                    Wishes will appear here.
                  </p>
                ) : (
                  [...wishes, ...wishes].map((w, i) => (
                    <div key={i} className={styles.wishCard}>
                      <p className={styles.wishCardName}>{w.name}</p>
                      <p className={styles.wishCardText}>{w.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <p className={styles.footerText}>
            Thank you for your lovely wishes. We look forward to your presence, prayers, and blessings on this special day. <br></br>Bismillahi Barakatillah
          </p>
        </div>
      </div>
    </section>
  );
}
