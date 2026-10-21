/**
 * Client for the ERP's public `/web/*` booking endpoints.
 *
 * The ERP is the single source of truth for prices, availability and whether a
 * booking is confirmed. This file only moves bytes: nothing here computes a
 * price, decides availability, or marks anything paid.
 *
 * The base URL is read from NEXT_PUBLIC_API_BASE, which is inlined at build
 * time because the site is a static export. It is normalised the same way as
 * the analytics ids (see lib/analytics.ts): GitHub Actions substitutes an unset
 * repository variable as an empty string, and an empty base would otherwise
 * turn every call into a request to the website's own origin.
 */

function base(value: string | undefined): string {
  return value ? value.replace(/\/+$/, '') : ''
}

export const API_BASE = base(process.env.NEXT_PUBLIC_API_BASE)

/** The API's category vocabulary. */
export type ApiCategory = 'premium_ac' | 'premium' | 'deluxe'

/**
 * Website room slug to API category. Only these three rooms can be booked
 * online; `single-room` and `dormitory` are enquiry-only and are deliberately
 * absent, so `onlineCategory()` returns undefined for them.
 */
const ONLINE_ROOMS: Record<string, { category: ApiCategory; maxGuests: number }> = {
  'premium-ac-room': { category: 'premium_ac', maxGuests: 4 },
  'premium-room': { category: 'premium', maxGuests: 4 },
  'double-room': { category: 'deluxe', maxGuests: 3 },
}

export const ONLINE_ROOM_SLUGS = Object.keys(ONLINE_ROOMS)

export function onlineCategory(slug: string): { category: ApiCategory; maxGuests: number } | undefined {
  return ONLINE_ROOMS[slug]
}

export type Stay = {
  category: ApiCategory
  check_in_date: string // YYYY-MM-DD
  check_in_time: string // HH:MM, 24h, IST on the server
  /** Number of 24h periods, not nights. 1..30. */
  days: number
  guests: number
}

export type Guest = {
  guest_name: string
  guest_mobile: string
  guest_email?: string
}

export type ApiConfig = { online_bookings_enabled: boolean; cleaning_gap_minutes?: number }
export type Availability = { available: boolean; price: number; currency: string }
export type Hold = { booking_id: string; amount: number; expires_at: string }
export type RazorpayOrder = { order_id: string; key_id: string; amount: number }

export type ApiFailure = {
  ok: false
  status: number
  /** Safe to show to the guest. */
  message: string
  /** 403 { enabled: false }: the kill-switch is on. */
  disabled?: boolean
  /** 409 { sold_out: true } from /web/hold. */
  soldOut?: boolean
  /** The request never reached the server, or its answer was unreadable. */
  network?: boolean
}
export type ApiResult<T> = { ok: true; data: T } | ApiFailure

const TIMEOUT_MS = 12_000

async function request<T>(
  path: string,
  isShape: (body: unknown) => body is T,
  init: { body?: unknown; signal?: AbortSignal } = {},
): Promise<ApiResult<T>> {
  if (!API_BASE) {
    return { ok: false, status: 0, network: true, message: 'Online booking is not configured.' }
  }

  const hasBody = init.body !== undefined
  const timeout = new AbortController()
  const timer = setTimeout(() => timeout.abort(), TIMEOUT_MS)
  // Honour the caller's signal as well as our own timeout.
  init.signal?.addEventListener('abort', () => timeout.abort(), { once: true })

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: hasBody ? 'POST' : 'GET',
      headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
      body: hasBody ? JSON.stringify(init.body) : undefined,
      signal: timeout.signal,
      cache: 'no-store',
    })

    const body: unknown = await res.json().catch(() => null)
    const obj = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>

    if (res.ok) {
      // A 200 is not proof of a valid answer: a reverse proxy or captive portal
      // can return HTML or an empty body with status 200. Anything that is not
      // the documented shape is a failure, so callers fail closed instead of
      // reading fields off null.
      if (isShape(body)) return { ok: true, data: body }
      return {
        ok: false,
        status: res.status,
        message: 'The booking service gave an unexpected answer. Please try again, or message us on WhatsApp.',
      }
    }

    const serverMessage = typeof obj.error === 'string' ? obj.error : undefined
    return {
      ok: false,
      status: res.status,
      disabled: res.status === 403 && obj.enabled === false,
      soldOut: res.status === 409 && obj.sold_out === true,
      message:
        serverMessage ??
        (res.status === 429 ? 'Too many requests. Please wait a moment.' : 'Something went wrong. Please try again.'),
    }
  } catch {
    return {
      ok: false,
      status: 0,
      network: true,
      message: 'Could not reach the booking service. Check your connection and try again.',
    }
  } finally {
    clearTimeout(timer)
  }
}

function isRecord(body: unknown): body is Record<string, unknown> {
  return typeof body === 'object' && body !== null
}

const isConfig = (b: unknown): b is ApiConfig => isRecord(b) && typeof b.online_bookings_enabled === 'boolean'
const isAvailability = (b: unknown): b is Availability =>
  isRecord(b) && typeof b.available === 'boolean' && typeof b.price === 'number' && Number.isFinite(b.price)
const isHold = (b: unknown): b is Hold =>
  isRecord(b) &&
  typeof b.booking_id === 'string' &&
  b.booking_id !== '' &&
  typeof b.amount === 'number' &&
  Number.isFinite(b.amount) &&
  typeof b.expires_at === 'string'
const isOrder = (b: unknown): b is RazorpayOrder =>
  isRecord(b) &&
  typeof b.order_id === 'string' &&
  b.order_id !== '' &&
  typeof b.key_id === 'string' &&
  b.key_id !== '' &&
  typeof b.amount === 'number'

export const bookingApi = {
  // No body means GET.
  config: (signal?: AbortSignal) => request<ApiConfig>('/web/config', isConfig, { signal }),
  availability: (stay: Stay, signal?: AbortSignal) =>
    request<Availability>('/web/availability', isAvailability, { body: stay, signal }),
  hold: (stay: Stay, guest: Guest) =>
    request<Hold>('/web/hold', isHold, { body: { ...stay, ...guest } }),
  order: (bookingId: string) =>
    request<RazorpayOrder>('/web/order', isOrder, { body: { booking_id: bookingId } }),
}
