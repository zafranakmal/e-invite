'use client';

import { useSearchParams } from 'next/navigation';

/**
 * Per-audience invitation variants, selected by the `?p=` query param.
 *
 *   ?p=v1 → Zafran's parents' guests — 7–9 PM, registry hidden
 *   ?p=v2 → Anis' parents' guests    — 7–9 PM, registry shown
 *   ?p=v3 → our friends and guests   — 9–11 PM, registry shown
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

const FULL: InviteVariant = {
  timeLabel: '7.00 PM – 11.00 PM',
  calendarDates: '20261031T190000/20261031T230000',
  countdownTarget: '2026-10-31T19:00:00+08:00',
  showRegistry: true,
};

const EARLY = {
  timeLabel: '7.00 PM – 9.00 PM',
  calendarDates: '20261031T190000/20261031T210000',
  countdownTarget: '2026-10-31T19:00:00+08:00',
} as const;

const VARIANTS: Record<string, InviteVariant> = {
  v1: { ...EARLY, showRegistry: false },
  v2: { ...EARLY, showRegistry: true },
  v3: {
    timeLabel: '9.00 PM – 11.00 PM',
    calendarDates: '20261031T210000/20261031T230000',
    countdownTarget: '2026-10-31T21:00:00+08:00',
    showRegistry: true,
  },
};

export function getInviteVariant(p: string | null | undefined): InviteVariant {
  return (p && VARIANTS[p]) || FULL;
}

/** Reads `?p=` from the URL. Callers must sit under a <Suspense> boundary. */
export function useInviteVariant(): InviteVariant {
  return getInviteVariant(useSearchParams().get('p'));
}
