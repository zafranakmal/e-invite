'use client';

import Link from 'next/link';
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
};

type Reservation = { id: string; itemId: string; name: string; mobile: string };

function formatPrice(price: number) {
  return price === 0 ? 'Any amount welcome' : `RM ${price.toLocaleString()}`;
}

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
  const [page, setPage] = useState(0);

  const ITEMS_PER_PAGE = 3;
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const visibleItems = items.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  // Fetch registry items, then load interest counts
  useEffect(() => {
    fetch('/api/registry')
      .then((r) => r.json())
      .then((data: RegistryItem[]) => {
        setItems(data);
        return Promise.all(
          data.map((item) =>
            fetch(`/api/registry/reservations?itemId=${item.id}`)
              .then((r) => r.json())
              .then((d) => [item.id, d.count ?? 0] as [string, number])
          )
        );
      })
      .then((entries) => setCounts(Object.fromEntries(entries)))
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
      if (!res.ok) throw new Error();
      setMyReservedIds((prev) => [...prev, itemId]);
      setCounts((prev) => ({ ...prev, [itemId]: (prev[itemId] ?? 0) + 1 }));
      setReservingId(null);
      setFormError('');
      setTimeout(() => {
        const el = document.getElementById('registry-payment');
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' });
      }, 300);
    } catch {
      setFormError('Something went wrong. Please try again.');
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
        <p className={styles.monogram}>A &amp; Z</p>
        <h1 className={styles.heading}>Gift Registry</h1>
        <p className={styles.sub}>
          Your presence at our celebration is the greatest gift of all.
          For those who wish to bless our new beginning, here are a few ideas close to our hearts.
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
                        <span className={styles.checkAmt}>{item ? formatPrice(item.price) : ''}</span>
                      </li>
                    );
                  })}
                </ul>
              )
            )}
          </div>
        )}
      </div>

      {/* ── Registry items grid ── */}
      <section className={styles.gridWrap}>
        <div className={styles.grid}>
        {visibleItems.map((item) => {
          const count = getCount(item.id);
          const isMine = myReservedIds.includes(item.id);
          const isReservingThis = reservingId === item.id;

          return (
            <div key={item.id} className={`${styles.card}${isMine ? ' ' + styles.cardReserved : ''}`}>
              <div className={styles.cardIcon}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.name} width={38} height={38} />
              </div>
              <h2 className={styles.cardTitle}>{item.name}</h2>
              <p className={styles.cardDesc}>{item.description}</p>
              <p className={styles.cardAmount}>{formatPrice(item.price)}</p>

              {count > 0 && (
                <p className={styles.interestCount}>
                  {count} {count === 1 ? 'person' : 'people'} interested
                </p>
              )}

              {isMine ? (
                <p className={styles.reservedBadge}>Reserved by you ✓</p>
              ) : item.reserved ? (
                <button disabled className={styles.reservedBtn}>Reserved</button>
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
                  <button onClick={() => startReserving(item.id)} className={styles.cardBtn}>
                    Reserve this gift
                  </button>
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
                </div>
              )}
            </div>
          );
        })}
        </div>

        {/* ── Pagination nav ── */}
        <div className={styles.pageNav}>
          <button
            className={styles.pageArrow}
            onClick={() => { setPage(p => p - 1); setReservingId(null); }}
            disabled={page === 0}
            aria-label="Previous page"
          >
            ←
          </button>

          <div className={styles.pageDots}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`${styles.pageDot}${i === page ? ' ' + styles.pageDotActive : ''}`}
                onClick={() => { setPage(i); setReservingId(null); }}
                aria-label={`Page ${i + 1}`}
              />
            ))}
          </div>

          <button
            className={styles.pageArrow}
            onClick={() => { setPage(p => p + 1); setReservingId(null); }}
            disabled={page === totalPages - 1}
            aria-label="Next page"
          >
            →
          </button>
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
            <p className={styles.paymentName}>Zafran Akmal bin Zainol Hisham</p>
          </div>

          {/* Bank transfer */}
          <div className={styles.paymentCard}>
            <p className={styles.paymentCardLabel}>Bank Transfer</p>
            <div className={styles.bankDetails}>
              <div className={styles.bankRow}>
                <span className={styles.bankRowLabel}>Bank</span>
                <span className={styles.bankRowValue}>Maybank</span>
              </div>
              <div className={styles.bankRow}>
                <span className={styles.bankRowLabel}>Account</span>
                <span className={styles.bankRowValue}>1234 5678 9012</span>
              </div>
              <div className={styles.bankRow}>
                <span className={styles.bankRowLabel}>Name</span>
                <span className={styles.bankRowValue}>Zafran Akmal bin Zainol Hisham</span>
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
