'use client'

import { useSyncExternalStore } from 'react'

/**
 * Date helpers for the booking flow.
 *
 * Everything is done in the property's own timezone and on plain `YYYY-MM-DD`
 * strings rather than Date objects. A guest in Bengaluru and a guest in London
 * looking at the same calendar must see the same "tonight", and Date arithmetic
 * across a timezone boundary is the classic way to end up one day out.
 */

const IST = 'Asia/Kolkata'

/** `YYYY-MM-DD` for a Date, in the property's timezone. */
export function toISO(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: IST }).format(date)
}

/** Today in the property's timezone. */
export function todayISO(): string {
  return toISO(new Date())
}

/** Parses `YYYY-MM-DD` into a UTC-noon Date, which cannot drift across a DST edge. */
export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12))
}

export function addDaysISO(iso: string, days: number): string {
  const date = fromISO(iso)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0
  const diff = fromISO(checkOut).getTime() - fromISO(checkIn).getTime()
  return Math.max(0, Math.round(diff / 86_400_000))
}

export function compareISO(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

/** `Fri 7 Aug` */
export function formatShort(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(fromISO(iso))
}

/** `Friday, 7 August 2026`, for screen readers and aria-labels. */
export function formatLong(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(fromISO(iso))
}

/** `August 2026` */
export function formatMonth(year: number, month: number): string {
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month, 1, 12)))
}

export type CalendarCell = { iso: string; day: number } | null

/**
 * A month as a flat array of 7-column rows.
 *
 * Weeks start on Monday, which is the convention in India and across most of
 * Europe. Leading and trailing blanks are `null` rather than greyed-out days
 * from the neighbouring month: a guest scanning for a date does not benefit
 * from seeing the 31st of last month, and blanks are simpler to make
 * accessible than disabled out-of-range cells.
 */
export function monthGrid(year: number, month: number): CalendarCell[] {
  const first = new Date(Date.UTC(year, month, 1, 12))
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0, 12)).getUTCDate()
  // getUTCDay is 0 for Sunday; shift so Monday is 0.
  const leading = (first.getUTCDay() + 6) % 7

  const cells: CalendarCell[] = Array.from({ length: leading }, () => null)
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      iso: new Date(Date.UTC(year, month, day, 12)).toISOString().slice(0, 10),
      day,
    })
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

/**
 * Today's date, safely, in a statically exported page.
 *
 * The HTML for this site is generated at build time, so the server has no idea
 * what day it is when a guest actually loads the page. Reading `new Date()`
 * during render therefore produces a hydration mismatch on every day after the
 * deploy (React error #418), and the guest briefly sees the build date.
 *
 * `useSyncExternalStore` is the sanctioned escape hatch: it returns the server
 * snapshot (an empty string, meaning "not known yet") during hydration, then
 * the real value on the very next render. Callers treat an empty string as
 * "no dates chosen", which is a legitimate state the UI already handles.
 */
const NO_SUBSCRIBE = () => () => {}

export function useClientToday(): string {
  return useSyncExternalStore(NO_SUBSCRIBE, todayISO, () => '')
}

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
