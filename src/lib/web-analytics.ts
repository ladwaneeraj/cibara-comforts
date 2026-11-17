/**
 * First-party analytics sink: fire-and-forget POSTs to the ERP's /web/event
 * ingest, so the owner's own dashboard (not just GA4) sees who visited, which
 * pages and rooms they looked at, where they are, and what they clicked.
 *
 * Three properties mirror visit-notification.tsx and must survive edits:
 *   - No-op when NEXT_PUBLIC_API_BASE is unset (same normalisation as the
 *     booking client), so a build without an ERP sends nothing.
 *   - Fire and forget. Every failure path is swallowed; nothing here is on the
 *     guest's critical path.
 *   - Bounded. Every string is clipped before it leaves the browser, so a
 *     crafted URL or referrer cannot post an oversized field to the ingest.
 *
 * Location is best effort via ipapi.co, looked up once per session and cached.
 * The IP never leaves the guest's browser for our servers — only the resolved
 * city/country label does. (visit-notification.tsx does its own lookup for the
 * owner's phone ping; the two are independent, one extra request per session.)
 */

import { API_BASE } from '@/lib/booking-api'

const MAX = 120

function clip(value: string | undefined): string | undefined {
  if (!value) return undefined
  const s = value.trim()
  return s ? s.slice(0, MAX) : undefined
}

let sid = ''
function sessionId(): string {
  if (sid) return sid
  try {
    sid = sessionStorage.getItem('wa_sid') ?? ''
    if (!sid) {
      sid = crypto.randomUUID()
      sessionStorage.setItem('wa_sid', sid)
    }
  } catch {
    // Storage blocked (private window): a per-tab id is enough for de-duping.
    sid = sid || `s_${Date.now()}_${Math.random().toString(16).slice(2)}`
  }
  return sid
}

type Geo = { country?: string; city?: string }
let geo: Geo = {}
let geoStarted = false

function loadGeo(): void {
  if (geoStarted) return
  geoStarted = true
  try {
    const cached = sessionStorage.getItem('wa_geo')
    if (cached) {
      geo = JSON.parse(cached) as Geo
      return
    }
  } catch {
    // ignore — fall through to the network lookup
  }
  fetch('https://ipapi.co/json/')
    .then((r) => r.json() as Promise<{ country_name?: string; city?: string; error?: boolean }>)
    .then((d) => {
      if (!d || d.error) return
      geo = { country: clip(d.country_name), city: clip(d.city) }
      try {
        sessionStorage.setItem('wa_geo', JSON.stringify(geo))
      } catch {
        // ignore
      }
    })
    .catch(() => {
      // offline, blocked, or rate limited — location is simply omitted
    })
}

function device(): 'mobile' | 'desktop' {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  return /Mobi|Android|iPhone|iPad|iPod/i.test(ua) ? 'mobile' : 'desktop'
}

/** External referrer host only; in-site navigation is noise. */
function referrer(): string | undefined {
  try {
    const r = document.referrer
    if (!r) return undefined
    const host = new URL(r).hostname
    return host === location.hostname ? undefined : clip(host.replace(/^www\./, ''))
  } catch {
    return undefined
  }
}

/**
 * Send one event. `type` is the event name (`page_view`, or a track() event
 * like `whatsapp_click`); `page` defaults to the current path.
 */
export function sendWebEvent(type: string, params: { page?: string; room?: string } = {}): void {
  if (typeof window === 'undefined' || !API_BASE) return
  loadGeo()
  const body = {
    type: clip(type),
    page: clip(params.page ?? location.pathname),
    room: clip(params.room),
    sid: sessionId(),
    device: device(),
    country: geo.country,
    city: geo.city,
    ref: referrer(),
  }
  try {
    void fetch(`${API_BASE}/web/event`, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => {})
  } catch {
    // ignore
  }
}
