'use client';

// zafranakmal7@gmail.com
// A&ZForever311026$#

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import styles from './dashboard.module.css';

type Tab = 'overview' | 'registry' | 'wishes' | 'guests';

const RELATION_OPTIONS = [
  'Core Families',
  'Families',
  'Friends',
  'Colleagues',
  'Wedding Connections',
] as const;

type Rsvp = {
  id: string;
  name: string;
  mobile: string;
  attending: boolean;
  guests: number;
  ref: string | null;
  relation: string | null;
  createdAt: string;
};

type RegistryItem = {
  id: string;
  name: string;
  description: string;
  url: string;
  price: number;
  imageUrl: string;
  reserved: boolean;
  reservation: { name: string; mobile: string } | null;
};

type Wish = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

const BLANK_FORM = { name: '', description: '', url: '', price: '', imageUrl: '' };
const TOTAL_CAPACITY = 1000;
const PAGE_SIZE = 10;
const WEDDING_DATE = new Date('2026-10-31T00:00:00');

const TAB_LABELS: Record<Tab, string> = {
  overview: 'Overview',
  registry: 'Registry',
  wishes: 'Wishes',
  guests: 'Guest List',
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [tab, setTab] = useState<Tab>('overview');
  const [dataLoading, setDataLoading] = useState(false);

  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [registry, setRegistry] = useState<RegistryItem[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);

  // Countdown to wedding date
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, past: false });

  useEffect(() => {
    const tick = () => {
      const diff = WEDDING_DATE.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, past: true });
        return;
      }
      setCountdown({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
        past: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Overview section expanded state
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ guests: false, registry: false, wishes: false });
  const toggleExpanded = (key: string) => setExpanded((p) => ({ ...p, [key]: !p[key] }));

  // Pagination state — one page index per table
  const [pages, setPages] = useState({ registry: 0, wishes: 0, guests: 0 });
  const goPage = (key: keyof typeof pages, dir: number) =>
    setPages((p) => ({ ...p, [key]: p[key] + dir }));

  // Guest list search & filters
  const [guestSearch, setGuestSearch] = useState('');
  const [filterRef, setFilterRef] = useState('');
  const [filterRelation, setFilterRelation] = useState('');

  // Relation popover
  const [openRelationId, setOpenRelationId] = useState<string | null>(null);

  // Registry form
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [formErr, setFormErr] = useState('');
  const [formBusy, setFormBusy] = useState(false);

  // Reservation assignment
  const [assigningItemId, setAssigningItemId] = useState<string | null>(null);
  const [assignForm, setAssignForm] = useState({ name: '', mobile: '' });
  const [assignError, setAssignError] = useState('');
  const [assignBusy, setAssignBusy] = useState(false);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/sign-in');
    }
  }, [session, isPending, router]);

  // Load RSVPs once for the overview stats
  useEffect(() => {
    if (!session) return;
    fetch('/api/rsvp')
      .then((r) => r.json())
      .then((d) => setRsvps(Array.isArray(d) ? d : []));
  }, [session]);

  // Reset pagination when switching tabs
  useEffect(() => {
    setPages({ registry: 0, wishes: 0, guests: 0 });
  }, [tab]);

  // Load per-tab data when tab changes
  useEffect(() => {
    if (!session) return;
    if (tab === 'guests') return; // RSVPs already loaded on mount

    const fetchRegistry = () =>
      fetch('/api/registry').then((r) => r.json()).then((d) => setRegistry(Array.isArray(d) ? d : []));
    const fetchWishes = () =>
      fetch('/api/wishes').then((r) => r.json()).then((d) => setWishes(Array.isArray(d) ? d : []));

    if (tab === 'overview') {
      setDataLoading(true);
      Promise.all([fetchRegistry(), fetchWishes()]).finally(() => setDataLoading(false));
    }
    if (tab === 'registry') {
      setDataLoading(true);
      fetchRegistry().finally(() => setDataLoading(false));
    }
    if (tab === 'wishes') {
      setDataLoading(true);
      fetchWishes().finally(() => setDataLoading(false));
    }
  }, [tab, session]);

  // ── Registry helpers ──────────────────────────────────────────────────────

  const startAdd = () => {
    setEditId(null);
    setForm(BLANK_FORM);
    setFormErr('');
    setShowForm(true);
  };

  const startEdit = (item: RegistryItem) => {
    setEditId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      url: item.url,
      price: String(item.price),
      imageUrl: item.imageUrl,
    });
    setFormErr('');
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(BLANK_FORM);
    setFormErr('');
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim() || !form.imageUrl.trim() || form.price === '') {
      setFormErr('Name, description, image URL and price are required.');
      return;
    }
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) {
      setFormErr('Enter a valid price (0 = open amount).');
      return;
    }
    setFormBusy(true);
    try {
      const body = {
        ...(editId ? { id: editId } : {}),
        name: form.name.trim(),
        description: form.description.trim(),
        url: form.url.trim(),
        price,
        imageUrl: form.imageUrl.trim(),
      };
      const res = await fetch('/api/registry', {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      cancelForm();
      const r = await fetch('/api/registry');
      setRegistry(await r.json());
    } catch {
      setFormErr('Something went wrong. Please try again.');
    } finally {
      setFormBusy(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this registry item? This cannot be undone.')) return;
    const res = await fetch('/api/registry', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setRegistry((prev) => prev.filter((i) => i.id !== id));
  };

  const clearReservation = async (itemId: string) => {
    if (!confirm('Clear this reservation? The item will be available again.')) return;
    const res = await fetch('/api/registry/reservations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    });
    if (res.ok) {
      setRegistry((prev) =>
        prev.map((i) => i.id === itemId ? { ...i, reserved: false, reservation: null } : i)
      );
    }
  };

  const submitAssign = async (itemId: string) => {
    if (!assignForm.name.trim() || !assignForm.mobile.trim()) {
      setAssignError('Name and mobile are required.');
      return;
    }
    setAssignBusy(true);
    try {
      const res = await fetch('/api/registry/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, name: assignForm.name, mobile: assignForm.mobile }),
      });
      if (!res.ok) throw new Error();
      const r = await fetch('/api/registry');
      setRegistry(await r.json());
      setAssigningItemId(null);
      setAssignForm({ name: '', mobile: '' });
      setAssignError('');
    } catch {
      setAssignError('Something went wrong.');
    } finally {
      setAssignBusy(false);
    }
  };

  // ── Wishes helpers ────────────────────────────────────────────────────────

  const deleteWish = async (id: string) => {
    if (!confirm('Delete this wish?')) return;
    const res = await fetch('/api/wishes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setWishes((prev) => prev.filter((w) => w.id !== id));
  };

  // Reset guest page when search or filters change
  useEffect(() => {
    setPages((p) => ({ ...p, guests: 0 }));
  }, [guestSearch, filterRef, filterRelation]);

  // Close relation popover on outside click
  useEffect(() => {
    if (!openRelationId) return;
    const close = () => setOpenRelationId(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [openRelationId]);

  // ── Relation update ────────────────────────────────────────────────────────

  const updateRelation = async (id: string, relation: string) => {
    const res = await fetch('/api/rsvp', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, relation: relation || null }),
    });
    if (res.ok) {
      const updated: Rsvp = await res.json();
      setRsvps((prev) => prev.map((r) => (r.id === id ? updated : r)));
    }
  };

  // ── Sign-out ──────────────────────────────────────────────────────────────

  const handleSignOut = async () => {
    await authClient.signOut();
    router.replace('/sign-in');
  };

  // ── Derived stats ─────────────────────────────────────────────────────────

  const attending = rsvps.filter((r) => r.attending);
  const uniqueRefs = Array.from(new Set(rsvps.map((r) => r.ref).filter(Boolean))) as string[];
  const filteredRsvps = rsvps.filter((r) => {
    if (guestSearch.trim() && !r.name.toLowerCase().includes(guestSearch.toLowerCase()) && !r.mobile.includes(guestSearch)) return false;
    if (filterRef && r.ref !== filterRef) return false;
    if (filterRelation && r.relation !== filterRelation) return false;
    return true;
  });
  const totalGuests = attending.reduce((sum, r) => sum + r.guests, 0);

  // ── Auth gate ─────────────────────────────────────────────────────────────

  if (isPending || !session) {
    return (
      <div className={styles.authGate}>
        <p>{isPending ? 'Checking authentication…' : 'Redirecting to sign in…'}</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className={styles.page}>

      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.monogram}>A &amp; Z</span>
          <h1 className={styles.headerTitle}>Dashboard</h1>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.headerEmail}>{session.user.email}</span>
          <button onClick={handleSignOut} className={styles.signOutBtn}>Sign out</button>
        </div>
      </header>

      {/* ── Tabs ── */}
      <nav className={styles.tabs}>
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`${styles.tab}${tab === t ? ' ' + styles.tabActive : ''}`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </nav>

      {/* ── Body ── */}
      <div className={styles.body}>
        {dataLoading ? (
          <p className={styles.loading}>Loading…</p>
        ) : tab === 'overview' ? (

          /* ── Overview ── */
          <div className={styles.overviewWrap}>

            {/* ── Countdown card ── */}
            <div className={styles.countdownCard}>
              <p className={styles.countdownLabel}>
                {countdown.past ? 'The big day has arrived!' : 'Counting down to the big day'}
              </p>
              <p className={styles.countdownDate}>31 October 2026</p>
              {!countdown.past && (
                <div className={styles.countdownUnits}>
                  {[
                    { value: countdown.days,    label: 'Days' },
                    { value: countdown.hours,   label: 'Hours' },
                    { value: countdown.minutes, label: 'Minutes' },
                    { value: countdown.seconds, label: 'Seconds' },
                  ].map(({ value, label }, i, arr) => (
                    <div key={label} className={styles.countdownUnitWrap}>
                      <div className={styles.countdownUnit}>
                        <span className={styles.countdownNum}>
                          {String(value).padStart(2, '0')}
                        </span>
                        <span className={styles.countdownUnitLabel}>{label}</span>
                      </div>
                      {i < arr.length - 1 && (
                        <span className={styles.countdownSep}>:</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.overviewGrid}>
              <div className={styles.statCard}>
                <p className={styles.statLabel}>RSVPs received</p>
                <p className={styles.statValue}>
                  {rsvps.length}
                  <span className={styles.statCap}> / {TOTAL_CAPACITY}</span>
                </p>
                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${Math.min((rsvps.length / TOTAL_CAPACITY) * 100, 100)}%` }}
                  />
                </div>
                <p className={styles.statSub}>{TOTAL_CAPACITY - rsvps.length} spots remaining</p>
              </div>

              <div className={styles.statCard}>
                <p className={styles.statLabel}>Confirmed attending</p>
                <p className={styles.statValue}>{attending.length}</p>
              </div>

              <div className={styles.statCard}>
                <p className={styles.statLabel}>Total guests</p>
                <p className={styles.statValue}>{totalGuests}</p>
                <p className={styles.statSub}>including +1s</p>
              </div>

              <div className={styles.statCard}>
                <p className={styles.statLabel}>Not attending</p>
                <p className={styles.statValue}>{rsvps.filter((r) => !r.attending).length}</p>
              </div>
            </div>

            {/* ── Preview sections ── */}
            <div className={styles.overviewPreviews}>

              {/* Guest List preview */}
              <div className={styles.previewCard}>
                <div className={styles.previewHeader}>
                  <div className={styles.previewHeaderLeft}>
                    <span className={styles.previewTitle}>Guest List</span>
                    <span className={styles.countPill}>{rsvps.length}</span>
                  </div>
                  <div className={styles.previewHeaderRight}>
                    <button className={styles.viewAllBtn} onClick={() => setTab('guests')}>
                      View all →
                    </button>
                    <button className={styles.expandBtn} onClick={() => toggleExpanded('guests')}>
                      {expanded.guests ? '▲' : '▼'}
                    </button>
                  </div>
                </div>
                {expanded.guests && (
                  <table className={styles.previewTable}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Mobile</th>
                        <th>Attending</th>
                        <th>Guests</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rsvps.length === 0 ? (
                        <tr><td colSpan={4} className={styles.empty}>No RSVPs yet.</td></tr>
                      ) : rsvps.slice(0, 5).map((r) => (
                        <tr key={r.id}>
                          <td>{r.name}</td>
                          <td className={styles.mono}>{r.mobile}</td>
                          <td>
                            <span className={r.attending ? styles.badgeReserved : styles.badgeNo}>
                              {r.attending ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className={styles.mono}>{r.attending ? r.guests : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {expanded.guests && rsvps.length > 5 && (
                  <div className={styles.previewFooter}>
                    <button className={styles.viewAllBtn} onClick={() => setTab('guests')}>
                      See all {rsvps.length} guests →
                    </button>
                  </div>
                )}
              </div>

              {/* Registry preview */}
              <div className={styles.previewCard}>
                <div className={styles.previewHeader}>
                  <div className={styles.previewHeaderLeft}>
                    <span className={styles.previewTitle}>Registry</span>
                    <span className={styles.countPill}>{registry.length} items</span>
                    <span className={styles.countPill}>
                      {registry.filter((i) => i.reserved).length} reserved
                    </span>
                  </div>
                  <div className={styles.previewHeaderRight}>
                    <button className={styles.viewAllBtn} onClick={() => setTab('registry')}>
                      Manage →
                    </button>
                    <button className={styles.expandBtn} onClick={() => toggleExpanded('registry')}>
                      {expanded.registry ? '▲' : '▼'}
                    </button>
                  </div>
                </div>
                {expanded.registry && (
                  <table className={styles.previewTable}>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Reserved by</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registry.length === 0 ? (
                        <tr><td colSpan={4} className={styles.empty}>No items yet.</td></tr>
                      ) : registry.map((item) => (
                        <tr key={item.id}>
                          <td className={styles.itemName}>{item.name}</td>
                          <td className={styles.mono}>
                            {item.price === 0 ? 'Open' : `RM ${item.price.toLocaleString()}`}
                          </td>
                          <td>
                            <span className={item.reserved ? styles.badgeReserved : styles.badgeOpen}>
                              {item.reserved ? 'Reserved' : 'Available'}
                            </span>
                          </td>
                          <td>
                            {item.reservation ? (
                              <span>{item.reservation.name} · <span className={styles.mono}>{item.reservation.mobile}</span></span>
                            ) : (
                              <span className={styles.dateCell}>—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Wishes preview */}
              <div className={styles.previewCard}>
                <div className={styles.previewHeader}>
                  <div className={styles.previewHeaderLeft}>
                    <span className={styles.previewTitle}>Wishes</span>
                    <span className={styles.countPill}>{wishes.length}</span>
                  </div>
                  <div className={styles.previewHeaderRight}>
                    <button className={styles.viewAllBtn} onClick={() => setTab('wishes')}>
                      View all →
                    </button>
                    <button className={styles.expandBtn} onClick={() => toggleExpanded('wishes')}>
                      {expanded.wishes ? '▲' : '▼'}
                    </button>
                  </div>
                </div>
                {expanded.wishes && (
                  <table className={styles.previewTable}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Message</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wishes.length === 0 ? (
                        <tr><td colSpan={3} className={styles.empty}>No wishes yet.</td></tr>
                      ) : wishes.slice(0, 5).map((w) => (
                        <tr key={w.id}>
                          <td className={styles.wishName}>{w.name}</td>
                          <td className={styles.wishMsg}>
                            {w.message.length > 80 ? w.message.slice(0, 80) + '…' : w.message}
                          </td>
                          <td className={styles.dateCell}>
                            {new Date(w.createdAt).toLocaleDateString('en-MY', { day: '2-digit', month: 'short' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {expanded.wishes && wishes.length > 5 && (
                  <div className={styles.previewFooter}>
                    <button className={styles.viewAllBtn} onClick={() => setTab('wishes')}>
                      See all {wishes.length} wishes →
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

        ) : tab === 'registry' ? (

          /* ── Registry ── */
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Registry Items</h2>
              {!showForm && (
                <button onClick={startAdd} className={styles.primaryBtn}>+ Add item</button>
              )}
            </div>

            {showForm && (
              <form onSubmit={submitForm} className={styles.itemForm}>
                <h3 className={styles.formTitle}>{editId ? 'Edit item' : 'New registry item'}</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Name *</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={styles.formInput}
                      placeholder="Stand Mixer"
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Price in RM (0 = open amount) *</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className={styles.formInput}
                      placeholder="1200"
                    />
                  </div>
                  <div className={`${styles.formField} ${styles.fullWidth}`}>
                    <label className={styles.formLabel}>Description *</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className={styles.formTextarea}
                      rows={2}
                      placeholder="A short description of the gift"
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Image URL *</label>
                    <input
                      value={form.imageUrl}
                      onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                      className={styles.formInput}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Product URL (optional)</label>
                    <input
                      value={form.url}
                      onChange={(e) => setForm({ ...form, url: e.target.value })}
                      className={styles.formInput}
                      placeholder="https://shopee.com/..."
                    />
                  </div>
                </div>
                {formErr && <p className={styles.formErr}>{formErr}</p>}
                <div className={styles.formActions}>
                  <button type="submit" className={styles.primaryBtn} disabled={formBusy}>
                    {formBusy ? 'Saving…' : editId ? 'Save changes' : 'Add item'}
                  </button>
                  <button type="button" onClick={cancelForm} className={styles.ghostBtn}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name &amp; Description</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Reserved by</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {registry.length === 0 ? (
                  <tr><td colSpan={5} className={styles.empty}>No items yet. Add one above.</td></tr>
                ) : registry.slice(pages.registry * PAGE_SIZE, (pages.registry + 1) * PAGE_SIZE).map((item) => (
                  <tr key={item.id}>
                    <td>
                      <p className={styles.itemName}>{item.name}</p>
                      <p className={styles.itemDesc}>{item.description}</p>
                    </td>
                    <td className={styles.mono}>
                      {item.price === 0 ? 'Open' : `RM ${item.price.toLocaleString()}`}
                    </td>
                    <td>
                      <span className={item.reserved ? styles.badgeReserved : styles.badgeOpen}>
                        {item.reserved ? 'Reserved' : 'Available'}
                      </span>
                    </td>
                    <td>
                      {item.reserved && item.reservation ? (
                        <div>
                          <p className={styles.itemName}>{item.reservation.name}</p>
                          <p className={styles.mono}>{item.reservation.mobile}</p>
                          <button
                            onClick={() => clearReservation(item.id)}
                            className={styles.deleteBtn}
                            style={{ marginTop: '0.4rem' }}
                          >
                            Clear
                          </button>
                        </div>
                      ) : assigningItemId === item.id ? (
                        <div className={styles.assignForm}>
                          <input
                            value={assignForm.name}
                            onChange={(e) => setAssignForm({ ...assignForm, name: e.target.value })}
                            placeholder="Name"
                            className={styles.assignInput}
                          />
                          <input
                            value={assignForm.mobile}
                            onChange={(e) => setAssignForm({ ...assignForm, mobile: e.target.value })}
                            placeholder="Mobile"
                            className={styles.assignInput}
                          />
                          {assignError && <p className={styles.formErr}>{assignError}</p>}
                          <div className={styles.rowActions} style={{ marginTop: '0.35rem' }}>
                            <button onClick={() => submitAssign(item.id)} className={styles.editBtn} disabled={assignBusy}>
                              {assignBusy ? '…' : 'Save'}
                            </button>
                            <button
                              onClick={() => { setAssigningItemId(null); setAssignError(''); }}
                              className={styles.deleteBtn}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setAssigningItemId(item.id); setAssignForm({ name: '', mobile: '' }); setAssignError(''); }}
                          className={styles.editBtn}
                        >
                          + Assign
                        </button>
                      )}
                    </td>
                    <td className={styles.rowActions}>
                      <button onClick={() => startEdit(item)} className={styles.editBtn}>Edit</button>
                      <button onClick={() => deleteItem(item.id)} className={styles.deleteBtn}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {registry.length > PAGE_SIZE && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  onClick={() => goPage('registry', -1)}
                  disabled={pages.registry === 0}
                >← Prev</button>
                <span className={styles.pageInfo}>
                  Page {pages.registry + 1} of {Math.ceil(registry.length / PAGE_SIZE)}
                </span>
                <button
                  className={styles.pageBtn}
                  onClick={() => goPage('registry', 1)}
                  disabled={(pages.registry + 1) * PAGE_SIZE >= registry.length}
                >Next →</button>
              </div>
            )}
          </div>

        ) : tab === 'wishes' ? (

          /* ── Wishes ── */
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Wishes &amp; Messages</h2>
              <span className={styles.countPill}>{wishes.length} total</span>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {wishes.length === 0 ? (
                  <tr><td colSpan={4} className={styles.empty}>No wishes yet.</td></tr>
                ) : wishes.slice(pages.wishes * PAGE_SIZE, (pages.wishes + 1) * PAGE_SIZE).map((w) => (
                  <tr key={w.id}>
                    <td className={styles.wishName}>{w.name}</td>
                    <td className={styles.wishMsg}>{w.message}</td>
                    <td className={styles.dateCell}>
                      {new Date(w.createdAt).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className={styles.rowActions}>
                      <button onClick={() => deleteWish(w.id)} className={styles.deleteBtn}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {wishes.length > PAGE_SIZE && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  onClick={() => goPage('wishes', -1)}
                  disabled={pages.wishes === 0}
                >← Prev</button>
                <span className={styles.pageInfo}>
                  Page {pages.wishes + 1} of {Math.ceil(wishes.length / PAGE_SIZE)}
                </span>
                <button
                  className={styles.pageBtn}
                  onClick={() => goPage('wishes', 1)}
                  disabled={(pages.wishes + 1) * PAGE_SIZE >= wishes.length}
                >Next →</button>
              </div>
            )}
          </div>

        ) : (

          /* ── Guest List ── */
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Guest List</h2>
              <span className={styles.countPill}>{rsvps.length} RSVPs</span>
            </div>
            <div className={styles.searchBar}>
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Search by name or mobile…"
                value={guestSearch}
                onChange={(e) => setGuestSearch(e.target.value)}
              />
              <div className={styles.filterBar}>
                <span className={styles.filterLabel}>Ref</span>
                <select
                  className={styles.filterSelect}
                  value={filterRef}
                  onChange={(e) => setFilterRef(e.target.value)}
                >
                  <option value="">All</option>
                  {uniqueRefs.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <span className={styles.filterLabel}>Relation</span>
                <select
                  className={styles.filterSelect}
                  value={filterRelation}
                  onChange={(e) => setFilterRelation(e.target.value)}
                >
                  <option value="">All</option>
                  {RELATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              {(guestSearch || filterRef || filterRelation) && (
                <span className={styles.searchCount}>
                  {filteredRsvps.length} result{filteredRsvps.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Attending</th>
                  <th>Guests</th>
                  <th>Ref</th>
                  <th>Relation</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredRsvps.length === 0 ? (
                  <tr><td colSpan={7} className={styles.empty}>
                    {guestSearch ? 'No matching guests.' : 'No RSVPs yet.'}
                  </td></tr>
                ) : filteredRsvps.slice(pages.guests * PAGE_SIZE, (pages.guests + 1) * PAGE_SIZE).map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td className={styles.mono}>{r.mobile}</td>
                    <td>
                      <span className={r.attending ? styles.badgeReserved : styles.badgeNo}>
                        {r.attending ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className={styles.mono}>{r.attending ? r.guests : '—'}</td>
                    <td className={styles.dateCell}>{r.ref ?? '—'}</td>
                    <td className={styles.relationCell}>
                      <div className={styles.relationWrap}>
                        <button
                          className={`${styles.relationPillBtn} ${r.relation ? styles[`rel${r.relation.replace(/\s+/g, '')}`] : styles.relationEmpty}`}
                          onClick={(e) => { e.stopPropagation(); setOpenRelationId(openRelationId === r.id ? null : r.id); }}
                        >
                          {r.relation ?? 'Set relation'}
                        </button>
                        {openRelationId === r.id && (
                          <div className={styles.relationPopover} onClick={(e) => e.stopPropagation()}>
                            {r.relation && (
                              <button
                                className={`${styles.relationOption} ${styles.relationClear}`}
                                onClick={() => { updateRelation(r.id, ''); setOpenRelationId(null); }}
                              >
                                Clear
                              </button>
                            )}
                            {RELATION_OPTIONS.map((opt) => (
                              <button
                                key={opt}
                                className={`${styles.relationOption} ${styles[`rel${opt.replace(/\s+/g, '')}`]}`}
                                onClick={() => { updateRelation(r.id, opt); setOpenRelationId(null); }}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(r.createdAt).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRsvps.length > PAGE_SIZE && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  onClick={() => goPage('guests', -1)}
                  disabled={pages.guests === 0}
                >← Prev</button>
                <span className={styles.pageInfo}>
                  Page {pages.guests + 1} of {Math.ceil(filteredRsvps.length / PAGE_SIZE)}
                </span>
                <button
                  className={styles.pageBtn}
                  onClick={() => goPage('guests', 1)}
                  disabled={(pages.guests + 1) * PAGE_SIZE >= filteredRsvps.length}
                >Next →</button>
              </div>
            )}
          </div>

        )}
      </div>
    </main>
  );
}
