'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './registry.module.css';

import { useState, useEffect } from 'react';

type RegistryItem = {
  id: string;
  name: string;
  description: string;
  url: string;
  price: number;
  imageUrl: string;
  reserved: boolean;
  /** How many guests this gift takes. */
  maxReservations: number;
  /** How many have reserved it so far. */
  reservedCount: number;
};

type Reservation = { id: string; itemId: string; name: string; mobile: string };

// Written with spaces for readability — the copy button strips them, so the
// clipboard always gets the bare digits.
const BANK_ACCOUNT = '0506 7021 3143 22';

const ClipboardIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default function RegistryPage() {
  const [items, setItems] = useState<RegistryItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [myReservedIds, setMyReservedIds] = useState<string[]>([]);
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', mobile: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkOpen, setCheckOpen] = useState(false);
  const [checkMobile, setCheckMobile] = useState('');
  const [checkResult, setCheckResult] = useState<Reservation[] | null>(null);
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAccount = async () => {
    const digits = BANK_ACCOUNT.replace(/\s+/g, '');
    try {
      await navigator.clipboard.writeText(digits);
    } catch {
      // navigator.clipboard needs a secure context; fall back for plain http.
      const el = document.createElement('textarea');
      el.value = digits;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      try { document.execCommand('copy'); } catch { /* nothing more to try */ }
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // /api/registry already carries reservedCount per item, so one request does it
  useEffect(() => {
    fetch('/api/registry')
      .then((r) => r.json())
      .then((data: RegistryItem[]) => {
        setItems(data);
        setCounts(Object.fromEntries(data.map((item) => [item.id, item.reservedCount ?? 0])));
      })
      .catch(() => {});
  }, []);

  const getCount = (itemId: string) => counts[itemId] ?? 0;

  const startReserving = (itemId: string) => {
    setReservingId(itemId);
    setForm({ name: '', mobile: '' });
    setFormError('');
  };

  const cancelReserving = () => {
    setReservingId(null);
    setFormError('');
  };

  const handleReserve = async (itemId: string) => {
    if (!form.name.trim() || !form.mobile.trim()) {
      setFormError('Please fill in both fields.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/registry/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, name: form.name, mobile: form.mobile }),
      });
      if (!res.ok) {
        // Surfaces "This gift is fully reserved." when the last slot went to
        // someone else while this form was open.
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Something went wrong. Please try again.');
      }
      setMyReservedIds((prev) => [...prev, itemId]);
      setCounts((prev) => ({ ...prev, [itemId]: (prev[itemId] ?? 0) + 1 }));
      setReservingId(null);
      setFormError('');
      setTimeout(() => {
        const el = document.getElementById('registry-payment');
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' });
      }, 300);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheck = async () => {
    if (!checkMobile.trim()) return;
    setChecking(true);
    try {
      const res = await fetch(`/api/registry/reservations?mobile=${encodeURIComponent(checkMobile.trim())}`);
      const data = await res.json();
      setCheckResult(Array.isArray(data) ? data : []);
    } catch {
      setCheckResult([]);
    } finally {
      setChecking(false);
    }
  };

  return (
    <main className={styles.page}>

      {/* ── Top bar ── */}
      <div className={styles.topBar}>
        <Link href="/" className={styles.backLink}>← Back to invitation</Link>
      </div>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        {/* The footer monogram is a white PNG — masked here so it takes the
            page's ink colour instead of vanishing into the light background. */}
        <div className={styles.monogram} role="img" aria-label="Anis &amp; Zafran" />
        <h1 className={styles.heading}>Gift Registry</h1>
        <p className={styles.sub}>
          Your presence at our wedding is the greatest gift of all! If you'd like to give a gift, feel free to use this registry as a guide — it just helps us avoid ending up with duplicates of the same item. Feel free to be creative and get anything you think we’d love too! In any case, we truly appreciate the thought and love.<br></br><br></br>p/s: Don’t be shy and do text either of us if you need our mailing address! 
          </p>
      </section>

      {/* ── Check my reservation ── */}
      <div className={styles.checkBar}>
        {!checkOpen ? (
          <div className={styles.checkCta}>
            <p className={styles.checkCtaText}>Already reserved something?</p>
            <button
              className={styles.checkCtaBtn}
              onClick={() => setCheckOpen(true)}
            >
              Check now
            </button>
          </div>
        ) : (
          <div className={styles.checkPanel}>
            <p className={styles.checkPanelLabel}>Enter your mobile number to see your reservations.</p>
            <div className={styles.checkRow}>
              <input
                type="tel"
                placeholder="e.g. 0123456789"
                value={checkMobile}
                onChange={(e) => { setCheckMobile(e.target.value); setCheckResult(null); }}
                className={styles.checkInput}
              />
              <button onClick={handleCheck} className={styles.checkBtn} disabled={checking}>
                {checking ? '…' : 'Check'}
              </button>
            </div>
            {checkResult !== null && (
              checkResult.length === 0 ? (
                <p className={styles.checkEmpty}>No reservations found for this number.</p>
              ) : (
                <ul className={styles.checkList}>
                  {checkResult.map((r, i) => {
                    const item = items.find((it) => it.id === r.itemId);
                    return (
                      <li key={i} className={styles.checkListItem}>
                        <span className={styles.checkTick}>✓</span>
                        {item?.name}
                      </li>
                    );
                  })}
                </ul>
              )
            )}
          </div>
        )}
      </div>

      {/* ── Registry items grid — every item at once, no paging ── */}
      <section className={styles.gridWrap}>
        <div className={styles.grid}>
        {items.map((item) => {
          const count = getCount(item.id);
          const capacity = item.maxReservations ?? 1;
          const spotsLeft = Math.max(capacity - count, 0);
          const isMine = myReservedIds.includes(item.id);
          const isFull = spotsLeft === 0;
          const isReservingThis = reservingId === item.id;

          return (
            <article key={item.id} className={`${styles.card}${isMine ? ' ' + styles.cardReserved : ''}`}>
              <div className={styles.cardMedia}>
                {/* cardMedia is a fixed viewport; the image covers it, so mixed
                    source ratios don't make the grid ragged. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.name} className={styles.cardImg} />
              </div>

              <div className={styles.cardBody}>
                <h2 className={styles.cardTitle}>{item.name}</h2>
                {/* title carries the full text — the desktop card clamps it to
                    three lines to keep the uniform card height down. */}
                {item.description && (
                  <p className={styles.cardDesc} title={item.description}>{item.description}</p>
                )}

                {capacity > 1 ? (
                  <p className={styles.interestCount}>
                    {count} of {capacity} reserved
                    {!isFull && ` · ${spotsLeft} left`}
                  </p>
                ) : count > 0 && (
                  <p className={styles.interestCount}>
                    {count} {count === 1 ? 'person' : 'people'} interested
                  </p>
                )}

                {isMine ? (
                  <p className={styles.reservedBadge}>Reserved by you ✓</p>
                ) : isFull ? (
                  <button disabled className={styles.reservedBtn}>Fully reserved</button>
                ) : isReservingThis ? (
                  <div className={styles.reserveForm}>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={styles.reserveInput}
                    />
                    <input
                      type="tel"
                      placeholder="Mobile no."
                      value={form.mobile}
                      onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                      className={styles.reserveInput}
                    />
                    {formError && <p className={styles.reserveError}>{formError}</p>}
                    <div className={styles.reserveActions}>
                      <button onClick={() => handleReserve(item.id)} className={styles.cardBtn} disabled={submitting}>
                        {submitting ? '…' : 'Confirm'}
                      </button>
                      <button onClick={cancelReserving} className={styles.cancelBtn}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.cardActions}>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.viewItemLink}
                      >
                        View item →
                      </a>
                    )}
                    <button onClick={() => startReserving(item.id)} className={styles.cardBtn}>
                      Reserve this gift
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
        </div>
      </section>

      {/* ── Payment section ── */}
      <section id="registry-payment" className={styles.payment}>
        <h2 className={styles.paymentTitle}>Send Your Gift</h2>
        <p className={styles.paymentSub}>
          All contributions go directly toward building our life together.
        </p>

        <div className={styles.paymentGrid}>
          {/* DuitNow QR */}
          <div className={styles.paymentCard}>
            <p className={styles.paymentCardLabel}>Scan via DuitNow</p>
            <div className={styles.qrFrame}>
              <Image
                src="/anis-qr.png"
                alt="DuitNow QR code for Bank Islam"
                width={1200}
                height={1200}
                className={styles.qrImg}
                sizes="(min-width: 1280px) 180px, 160px"
              />
            </div>
            <p className={styles.paymentName}>Cik Anis Sufea Binti Ismail</p>
            {/* Same-origin, so `download` sets the saved filename rather than
                opening the image in a tab. */}
            <a href="/qr-bank-download.jpeg" download className={styles.qrDownload}>
              Download QR
            </a>
          </div>

          {/* Bank transfer */}
          <div className={styles.paymentCard}>
            <p className={styles.paymentCardLabel}>Bank Transfer</p>
            <div className={styles.bankDetails}>
              <div className={styles.bankRow}>
                <span className={styles.bankRowLabel}>Bank</span>
                <span className={styles.bankRowValue}>Bank Islam</span>
              </div>
              <div className={styles.bankRow}>
                <span className={styles.bankRowLabel}>Account</span>
                <span className={styles.bankRowValue}>{BANK_ACCOUNT}</span>
                <button
                  type="button"
                  onClick={copyAccount}
                  className={styles.copyBtn}
                  aria-label={copied ? 'Account number copied' : 'Copy account number'}
                  title="Copy account number"
                >
                  {copied ? <CheckIcon /> : <ClipboardIcon />}
                </button>
              </div>
              <div className={styles.bankRow}>
                <span className={styles.bankRowLabel}>Name</span>
                <span className={styles.bankRowValue}>Cik Anis Sufea Binti Ismail</span>
              </div>
            </div>
          </div>
        </div>

        <p className={styles.paymentNote}>
          Kindly include your name as the transfer reference.
          Thank you for your love and generosity — it means the world to us.
        </p>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <p>With love, Anis &amp; Zafran</p>
        <Link href="/" className={styles.backLink}>← Return to invitation</Link>
      </footer>
    </main>
  );
}
