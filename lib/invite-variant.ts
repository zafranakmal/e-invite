'use client';

import { useSearchParams } from 'next/navigation';

/**
 * Per-audience invitation variants, selected by the `?p=` query param.
 *
 *   ?p=v1 → Zafran's parents' guests — 7–9 PM, registry hidden
 *   ?p=v2 → Anis' parents' guests    — 7–9 PM, registry shown
 *   ?p=v3 → our friends and guests   — 9–11 PM, registry shown
 *
 * `?t=` sets the session window on its own, for links that only need to say
 * which sitting a guest is invited to:
 *
 *   ?t=7 → 1st session, 7–9 PM
 *   ?t=9 → 2nd session, 9–11 PM
 *
 * The two compose: `?t=` overrides whatever the `?p=` variant said about time
 * and leaves the registry to `?p=`, so `?p=v1&t=9` is a 9–11 PM guest with the
 * registry hidden. Time is one decision — the label, the calendar range and the
 * countdown all move together, or the card and the "Add to Calendar" button end
 * up disagreeing.
 *
 * No param (or an unknown one) falls back to the full 7–11 PM invitation with
 * the registry, so a stripped or mistyped link never shows less than the truth.
 */
export interface InviteVariant {
  /** Reception window printed on the invitation card. */
  timeLabel: string;
  /** Google Calendar `dates` range — local time, matching `timeLabel`. */
  calendarDates: string;
  /** Countdown target: the start of this audience's window, in MYT. */
  countdownTarget: string;
  /** Whether the gift registry card and button appear on the main page. */
  showRegistry: boolean;
}

/** The time half of a variant — everything `?t=` is allowed to set. */
type InviteWindow = Pick<InviteVariant, 'timeLabel' | 'calendarDates' | 'countdownTarget'>;

const EARLY: InviteWindow = {
  timeLabel: '7.00 PM – 9.00 PM',
  calendarDates: '20261031T190000/20261031T210000',
  countdownTarget: '2026-10-31T19:00:00+08:00',
};

const LATE: InviteWindow = {
  timeLabel: '9.00 PM – 11.00 PM',
  calendarDates: '20261031T210000/20261031T230000',
  countdownTarget: '2026-10-31T21:00:00+08:00',
};

const FULL: InviteVariant = {
  timeLabel: '7.00 PM – 11.00 PM',
  calendarDates: '20261031T190000/20261031T230000',
  countdownTarget: '2026-10-31T19:00:00+08:00',
  showRegistry: true,
};

const VARIANTS: Record<string, InviteVariant> = {
  v1: { ...EARLY, showRegistry: false },
  v2: { ...EARLY, showRegistry: true },
  v3: { ...LATE, showRegistry: true },
};

/** `?t=` — the session a guest is invited to, keyed by its starting hour. */
const WINDOWS: Record<string, InviteWindow> = {
  '7': EARLY,
  '9': LATE,
};

export function getInviteVariant(
  p: string | null | undefined,
  t?: string | null | undefined,
): InviteVariant {
  const variant = (p && VARIANTS[p]) || FULL;
  const window = t && WINDOWS[t];
  return window ? { ...variant, ...window } : variant;
}

/** Reads `?p=` and `?t=`. Callers must sit under a <Suspense> boundary. */
export function useInviteVariant(): InviteVariant {
  const params = useSearchParams();
  return getInviteVariant(params.get('p'), params.get('t'));
}
