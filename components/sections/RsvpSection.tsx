'use client';

import { CSSProperties, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import styles from './RsvpSection.module.css';
import PillButton from '../design/PillButton';
import FormField from '../design/FormField';

const RELATION_OPTIONS = ['Core Families', 'Families', 'Friends', 'Colleagues', 'Wedding Connections'];

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

interface RsvpSectionProps {
  style?: CSSProperties;
  /** Called after a wish is successfully posted, so the wishes list can refresh. */
  onWishPosted?: () => void;
}

export default function RsvpSection({ style, onWishPosted }: RsvpSectionProps) {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') ?? '';

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
        onWishPosted?.();
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

  return (
    <section id="rsvp" className={styles.section}>
      <div className={styles.bg}>
        <Image src="/el-bg-rsvp.png" alt="" fill sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'left top' }} />
      </div>

      <div className={styles.glass} style={style}>
        <div className={styles.inner}>
          <h2 className={styles.heading}>Save your seat!</h2>

          {rsvpSubmitted ? (
            <div className={styles.rsvpSuccess}>
              <p>
                Thank you, <em>{rsvpData.name || 'friend'}</em>! We look forward to seeing you.
              </p>
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
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
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
                  <p>
                    You are attending with <strong>{checkResult.guests}</strong> {checkResult.guests === 1 ? 'guest' : 'guests'}.
                  </p>
                ) : (
                  <p>You have indicated that you will not be attending.</p>
                )}
              </div>
            )}
            {checkResult === 'not-found' && <p className={styles.checkNotFound}>No RSVP found for this number.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
