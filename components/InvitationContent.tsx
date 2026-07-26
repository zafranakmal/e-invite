'use client';

import { CSSProperties, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import Snowfall from 'react-snowfall';
import styles from './InvitationContent.module.css';
import PillButton from './design/PillButton';
import ScallopCard from './design/ScallopCard';
import FormField from './design/FormField';
import Countdown from './design/Countdown';
import WishCard from './design/WishCard';

const RELATION_OPTIONS = [
  'Core Families',
  'Families',
  'Friends',
  'Colleagues',
  'Wedding Connections',
];

const fieldStyle: CSSProperties = {
  flex: 1,
  border: 'none',
  borderBottom: '1px solid var(--c-line)',
  background: 'transparent',
  fontFamily: 'var(--font-body)',
  fontSize: 16,
  color: 'var(--c-ink)',
  padding: '0.3rem 0.2rem',
  outline: 'none',
  width: '100%',
};

const textareaStyle: CSSProperties = {
  ...fieldStyle,
  border: '1px solid var(--c-line)',
  padding: '0.5rem',
  background: 'rgba(255,255,255,0.3)',
  resize: 'vertical',
};

const checkInputStyle: CSSProperties = { ...fieldStyle, flex: 'none', width: 180, textAlign: 'center' };

const scriptHeading: CSSProperties = {
  fontFamily: 'var(--font-script)',
  fontSize: 'var(--t-script-md)',
  color: 'var(--c-gold)',
};

function fadeUp(isIn?: boolean): CSSProperties {
  return {
    opacity: isIn ? 1 : 0,
    transform: isIn ? 'translateY(0)' : 'translateY(20px)',
    transition: 'opacity 0.7s var(--ease), transform 0.7s var(--ease)',
  };
}

const WazeIcon = () => (
  <svg viewBox="0 0 32 32" width="18" height="18" fill="none">
    <path d="M16 3C9.9 3 5 7.7 5 13.5c0 4.8 3.1 8.9 7.5 10.5L11 29l5-3.5 5 3.5-1.5-5C24 21.9 27 17.5 27 13.5 27 7.7 22.1 3 16 3z" fill="#00d5d6" />
    <circle cx="12.5" cy="13" r="1.8" fill="white" />
    <circle cx="19.5" cy="13" r="1.8" fill="white" />
    <path d="M12 18c1.5 2.5 7 2.5 8 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

const MapsIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <path d="M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7z" fill="#EA4335" />
    <circle cx="12" cy="9" r="2.5" fill="white" />
  </svg>
);

type Wish = { id: string; name: string; message: string };

interface InvitationContentProps {
  revealed: boolean;
}

export default function InvitationContent({ revealed }: InvitationContentProps) {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') ?? '';

  const [wishes, setWishes] = useState<Wish[]>([]);
  const [sectionsIn, setSectionsIn] = useState<Record<string, boolean>>({});
  const [snowflakeCount, setSnowflakeCount] = useState(60);

  useEffect(() => {
    const updateSnowflakeCount = () => setSnowflakeCount(Math.round((10 * window.innerWidth) / 100));
    updateSnowflakeCount();
    window.addEventListener('resize', updateSnowflakeCount);
    return () => window.removeEventListener('resize', updateSnowflakeCount);
  }, []);

  useEffect(() => {
    const ids = ['itinerary', 'rsvp', 'gift', 'wishes'];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSectionsIn((s) => ({ ...s, [entry.target.id]: true }));
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

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
  const [copied, setCopied] = useState(false);

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

  const handleCopyAccount = () => {
    if (navigator.clipboard) navigator.clipboard.writeText('123456789012');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wazeUrl = 'https://waze.com/ul/hw282984jm';
  const googleMapsUrl = 'https://maps.app.goo.gl/hrAxPHoTWdKjrtNJ6';
  const calendarUrl =
    'https://www.google.com/calendar/render?action=TEMPLATE' +
    '&text=Anis+%26+Zafran+Wedding' +
    '&dates=20261031T190000/20261031T230000' +
    '&details=Walimatul+Urus' +
    '&location=Grand+Ballroom,+BoraOmbak+Marina+Putrajaya';

  const pillStyle = (i: number): CSSProperties => ({
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 0.5s var(--ease) ${0.3 + i * 0.12}s, transform 0.5s var(--ease) ${0.3 + i * 0.12}s`,
  });

  return (
    <section
      id="invitation"
      className={`${styles.invitationSection}${revealed ? ' ' + styles.visible : ''}`}
    >
      {/* ── Screen 1: Invitation card ── */}
      <div className={`${styles.screenSection} ${styles.heroCardSection}`}>
        <div className={styles.heroCardBg}>
          <Image
            src="/bg-1.jpg"
            alt=""
            fill
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
        </div>

        <Snowfall
          snowflakeCount={snowflakeCount}
          color="rgba(248, 243, 242, 0.62)"
          radius={[2.3, 4]}
          speed={[0.7, 1.5]}
          wind={[-0.5, 0.5]}
          style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}
        />

        <div className={styles.heroCardContent}>
          <div className={styles.cardFrame}>
            <div className={styles.cardBox}>
              <Image
                src="/invitation-card-blank.png"
                alt=""
                fill
                sizes="(max-width: 700px) 104vw, 560px"
                className={styles.cardImage}
                priority
              />

              <div className={styles.cardType}>
                {/* <p className={styles.cardArabic} style={fadeUp(revealed)}>
                  السلام عليكم ورحمة الله وبركاته
                </p> */}

                <div className={styles.cardParents} style={{ ...fadeUp(revealed), transitionDelay: '0.15s' }}>
                  <p>Ismail bin Tawnie</p>
                  <p>Nor Raba&rsquo;ah binti Zakaria</p>
                  <p className={styles.cardDan}>dan</p>
                  <p>Haji Zainol Hisham bin Osman</p>
                  <p>Zahariyah binti Yeop</p>
                </div>

                <p className={styles.cardInvite} style={{ ...fadeUp(revealed), transitionDelay: '0.3s' }}>
                  dengan penuh kesyukuran menjemput<br />
                  Tan Sri / Puan Sri / Dato&rsquo; Seri / Datin Seri /<br />
                  Dato&rsquo; / Datin / Tuan / Puan dan pasangan<br />
                  hadir ke majlis perkahwinan anakanda kami
                </p>

                <h1 className={styles.cardCouple} style={{ ...fadeUp(revealed), transitionDelay: '0.45s' }}>
                  Anis Sufea <br></br><span className={styles.coupleDan}>dan</span><br></br> Zafran Akmal
                </h1>

                <p className={styles.cardDetails} style={{ ...fadeUp(revealed), transitionDelay: '0.45s' }}>
                  Sabtu, 31 Oktober 2026<br />
                  7.00 PM &ndash; 11.00 PM<br />
                  Grand Ballroom,<br />
                  BoraOmbak Putrajaya
                </p>
              </div>
            </div>
          </div>

          <div className={styles.ctaRow}>
            <PillButton as="a" href={wazeUrl} target="_blank" rel="noopener noreferrer" variant="light" icon={<WazeIcon />} style={pillStyle(0)}>
              Waze
            </PillButton>
            <PillButton as="a" href={googleMapsUrl} target="_blank" rel="noopener noreferrer" variant="light" icon={<MapsIcon />} style={pillStyle(1)}>
              Google Maps
            </PillButton>
            <PillButton as="a" href={calendarUrl} target="_blank" rel="noopener noreferrer" variant="dark" style={pillStyle(2)}>
              Add to Calendar
            </PillButton>
          </div>
        </div>
      </div>

      {/* ── Screen 2: Itinerary ── */}
      <div id="itinerary" className={styles.screenSection}>
        <div style={fadeUp(sectionsIn.itinerary)}>
          <Image
            src="/itinerary-card.png"
            alt="Reception Itinerary: 7.00 PM Arrival of Guests, 8.00 PM Arrival of Bride & Groom, 8.45 PM Cake-cutting Ceremony, 9.00 PM Photography Session, 11.00 PM End of Reception"
            width={1409}
            height={2000}
            className={styles.invitationCard}
          />
        </div>
      </div>

      {/* ── Screen 3: RSVP ── */}
      <div id="rsvp" className={styles.screenSection}>
        <div style={fadeUp(sectionsIn.rsvp)} className={styles.cardWrap}>
          <ScallopCard variant="rect" tone="cream">
            <Countdown target="2026-10-31T19:00:00" style={{ margin: '1rem 1.5rem'}} />
            <h2 style={{ ...scriptHeading, margin: '1rem 1.5rem 1rem 1.5rem' }}>Save your seat!</h2>

            {rsvpSubmitted ? (
              <div className={styles.rsvpSuccess}>
                <p>Thank you, <em>{rsvpData.name || 'friend'}</em>! We look forward to seeing you.</p>
              </div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className={styles.rsvpForm}>
                <FormField label="Name:" htmlFor="rsvp-name" className={styles.formFieldRow} labelClassName={styles.formFieldLabel}>
                  <input
                    id="rsvp-name"
                    type="text"
                    style={fieldStyle}
                    required
                    placeholder="Your name"
                    value={rsvpData.name}
                    onChange={(e) => setRsvpData({ ...rsvpData, name: e.target.value })}
                  />
                </FormField>
                <FormField label="Mobile No.:" htmlFor="rsvp-mobile" className={styles.formFieldRow} labelClassName={styles.formFieldLabel}>
                  <input
                    id="rsvp-mobile"
                    type="tel"
                    style={fieldStyle}
                    required
                    placeholder="e.g. 0123456789"
                    value={rsvpData.mobile}
                    onChange={(e) => setRsvpData({ ...rsvpData, mobile: e.target.value })}
                  />
                </FormField>
                <FormField label="Will you be attending?" htmlFor="rsvp-attending" className={styles.formFieldRow} labelClassName={styles.formFieldLabel}>
                  <select
                    id="rsvp-attending"
                    style={fieldStyle}
                    required
                    value={rsvpData.attending}
                    onChange={(e) => setRsvpData({ ...rsvpData, attending: e.target.value })}
                  >
                    <option value="">Select...</option>
                    <option value="yes">Yes, I will attend</option>
                    <option value="no">Sorry, I cannot attend</option>
                  </select>
                </FormField>
                <FormField
                  label="Number of pax:"
                  note="(max. 2 pax per guest)"
                  align="top"
                  htmlFor="rsvp-pax"
                  className={styles.formFieldRow}
                  labelClassName={styles.formFieldLabel}
                >
                  <select
                    id="rsvp-pax"
                    style={fieldStyle}
                    value={rsvpData.pax}
                    onChange={(e) => setRsvpData({ ...rsvpData, pax: e.target.value })}
                  >
                    <option value="">Select...</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                </FormField>
                <FormField label="Your relation to us:" htmlFor="rsvp-relation" className={styles.formFieldRow} labelClassName={styles.formFieldLabel}>
                  <select
                    id="rsvp-relation"
                    style={fieldStyle}
                    value={rsvpData.relation}
                    onChange={(e) => setRsvpData({ ...rsvpData, relation: e.target.value })}
                  >
                    <option value="">Select... (optional)</option>
                    {RELATION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Your wish:" align="top" htmlFor="rsvp-wish" className={styles.formFieldRow} labelClassName={styles.formFieldLabel}>
                  <textarea
                    id="rsvp-wish"
                    rows={4}
                    style={textareaStyle}
                    placeholder="Share your wishes..."
                    value={rsvpData.wish}
                    onChange={(e) => setRsvpData({ ...rsvpData, wish: e.target.value })}
                  />
                </FormField>

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
                <PillButton as="button" type="submit" variant="dark" style={{ alignSelf: 'center', marginTop: '0.5rem' }} disabled={rsvpSubmitting}>
                  {rsvpSubmitting ? 'Sending…' : 'Send RSVP'}
                </PillButton>
              </form>
            )}

            {/* ── Check RSVP ── */}
            <div className={styles.checkRsvp}>
              <p className={styles.checkTitle}>Already submitted? Check your RSVP.</p>
              <div className={styles.checkRow}>
                <input
                  type="tel"
                  inputMode="numeric"
                  style={checkInputStyle}
                  value={checkMobile}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    setCheckMobile(digits);
                    setCheckResult(null);
                  }}
                  placeholder="Enter your mobile no."
                />
                <PillButton as="button" type="button" variant="outlined" onClick={handleCheckRsvp} disabled={checkLoading}>
                  {checkLoading ? '…' : 'Check'}
                </PillButton>
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
          </ScallopCard>
        </div>
      </div>

      {/* ── Screen 4: Gift / DuitNow ── */}
      <div id="gift" className={styles.screenSection}>
        <div style={fadeUp(sectionsIn.gift)} className={styles.cardWrap}>
          <ScallopCard variant="quilted">
            <p className={styles.giftEyebrow}>A token of love</p>
            <h2 style={{ ...scriptHeading, margin: '0 0 0.75rem' }}>Gift Registry</h2>
            <p className={styles.giftDesc}>
              Should you wish to bless our new beginning, a heartfelt contribution is warmly welcomed.
            </p>

            <div className={styles.qrCard}>
              <p className={styles.qrCardLabel}>Scan to send via DuitNow</p>
              <div className={styles.qrFrame}>
                <svg viewBox="0 0 120 120" width="140" height="140">
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

            <div className={styles.bankWrap}>
              <p className={styles.bankOr}>or transfer directly</p>
              <p className={styles.bankName}>
                Maybank &nbsp;·&nbsp; 1234 5678 9012
                <button onClick={handleCopyAccount} className={styles.copyBtn}>{copied ? 'Copied!' : 'copy'}</button>
              </p>
              <p className={styles.bankHolder}>Zafran Akmal bin Zainol Hisham</p>
            </div>

            <PillButton as="a" href="/registry" variant="outlined">View Gift Registry →</PillButton>
          </ScallopCard>
        </div>
      </div>

      {/* ── Screen 5: Warm wishes ── */}
      <div id="wishes" className={styles.screenSection}>
        <div style={fadeUp(sectionsIn.wishes)} className={styles.wishesSection}>
          <h2 style={{ ...scriptHeading, marginBottom: '0.5rem' }}>Warm Wishes</h2>
          <p className={styles.wishesSubtitle}>From our loved ones</p>
          <div className={styles.wishesList}>
            {wishes.length === 0 ? (
              <p className={styles.wishesEmpty}>Wishes will appear here.</p>
            ) : (
              wishes.map((w, i) => (
                <WishCard
                  key={w.id}
                  name={w.name}
                  message={w.message}
                  style={{
                    opacity: sectionsIn.wishes ? 1 : 0,
                    transform: sectionsIn.wishes ? 'translateY(0)' : 'translateY(16px)',
                    transition: `opacity 0.6s var(--ease) ${i * 0.14}s, transform 0.6s var(--ease) ${i * 0.14}s`,
                  }}
                />
              ))
            )}
          </div>
          <p className={styles.footerText}>
            Thank you for your lovely wishes. We look forward to your presence, prayers, and blessings on this special day.<br />Bismillahi Barakatillah
          </p>
        </div>
      </div>
    </section>
  );
}
