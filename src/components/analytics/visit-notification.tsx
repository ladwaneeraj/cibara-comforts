'use client'

import { useEffect } from 'react'

/**
 * Owner visit notification.
 *
 * Pings the owner's phone through ntfy.sh once per browser session. Restored
 * from the pre-rewrite site (_legacy/index.html), which is where this lived
 * until the Next.js rebuild dropped it, and extended with the fields that
 * actually matter now that the property is paying for traffic: whether the
 * visit came from a Google Ad, which campaign, and what the connection looks
 * like.
 *
 * Three properties are deliberate and should survive future edits:
 *
 *   Fire and forget. Every failure path is swallowed. A blocked fetch, a
 *   rate-limited geo lookup or storage denied in a private window must never
 *   affect what the guest sees. Nothing here is on the critical path.
 *
 *   Once per session. sessionStorage is set before anything async starts, so a
 *   refresh, a StrictMode double-effect in development, and client-side
 *   navigation all collapse into one notification.
 *
 *   Opt-out for the owner. Run localStorage.setItem('ntfy_mute','1') once in a
 *   browser and it stops notifying from that browser, so checking your own site
 *   does not buzz your own phone.
 *
 * Known limitation, accepted: the topic is readable in the client bundle, so
 * anyone who looks can post to it. That was equally true of the old site. The
 * topic is a long random string, so it will not be guessed, only deliberately
 * read. Fixing it properly needs a server to relay through, which a static
 * export on GitHub Pages does not have.
 *
 * Privacy note: the geo lookup sends the visitor's IP to ipapi.co, and the
 * visit counter lives in the visitor's own localStorage. Both were in the
 * original. Set NEXT_PUBLIC_NTFY_TOPIC empty to disable the whole thing.
 */

const TOPIC = process.env.NEXT_PUBLIC_NTFY_TOPIC

type UserAgentData = {
  mobile?: boolean
  platform?: string
  brands?: { brand: string; version: string }[]
}

type NetworkInformation = { effectiveType?: string }

type GeoResponse = {
  error?: boolean
  city?: string
  region?: string
  country_name?: string
  country_code?: string
  org?: string
}

function userAgentData(): UserAgentData | undefined {
  return (navigator as Navigator & { userAgentData?: UserAgentData }).userAgentData
}

function effectiveType(): string | undefined {
  return (navigator as Navigator & { connection?: NetworkInformation }).connection?.effectiveType
}

/** Turn a raw referrer into a label a human can act on. */
function referrerLabel(ref: string): string {
  if (!ref) return 'Direct or saved link'
  let host: string
  try {
    host = new URL(ref).hostname.replace(/^www\./, '')
  } catch {
    return ref
  }
  if (host === location.hostname) return 'Within your site'
  if (host.startsWith('google.')) return 'Google'
  if (host.startsWith('bing.')) return 'Bing'
  if (host.startsWith('duckduckgo.')) return 'DuckDuckGo'
  if (host.includes('instagram.')) return 'Instagram'
  if (host.includes('facebook.') || host === 'fb.com') return 'Facebook'
  if (host === 't.co' || host === 'twitter.com' || host === 'x.com') return 'Twitter/X'
  if (host.includes('whatsapp') || host === 'wa.me') return 'WhatsApp'
  if (host.includes('youtube.') || host === 'youtu.be') return 'YouTube'
  if (host.includes('booking.com')) return 'Booking.com'
  if (host.includes('makemytrip') || host.includes('goibibo')) return 'MakeMyTrip / Goibibo'
  if (host.includes('tripadvisor')) return 'TripAdvisor'
  return host
}

/** Regional indicator flag from a two-letter country code. */
function flag(code: string | undefined): string {
  if (!code || code.length !== 2) return ''
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
}

/** Browser name, from client hints where available and the UA string otherwise. */
function browserName(): string {
  const brands = userAgentData()?.brands
  if (brands?.length) {
    const real = brands.find((b) => !/not.a.brand/i.test(b.brand))
    if (real) return real.brand
  }
  const ua = navigator.userAgent || ''
  if (/Edg\//.test(ua)) return 'Edge'
  if (/OPR\//.test(ua)) return 'Opera'
  if (/Chrome\//.test(ua)) return 'Chrome'
  if (/Firefox\//.test(ua)) return 'Firefox'
  if (/Safari\//.test(ua)) return 'Safari'
  return 'Unknown browser'
}

function platformName(): string {
  const platform = userAgentData()?.platform
  if (platform) return platform
  const ua = navigator.userAgent || ''
  if (/Android/i.test(ua)) return 'Android'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS'
  if (/Windows/i.test(ua)) return 'Windows'
  if (/Mac OS X/i.test(ua)) return 'macOS'
  if (/Linux/i.test(ua)) return 'Linux'
  return 'Unknown OS'
}

function isMobile(): boolean {
  const hint = userAgentData()?.mobile
  if (typeof hint === 'boolean') return hint
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '')
}

function ordinal(n: number): string {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'
  return `${n}${suffix}`
}

export function VisitNotification() {
  useEffect(() => {
    if (!TOPIC) return

    let visitNumber = 1
    try {
      if (localStorage.getItem('ntfy_mute')) return
      // Set before any async work so a refresh or a StrictMode re-run cannot
      // produce a second notification.
      if (sessionStorage.getItem('ntfy_pinged')) return
      sessionStorage.setItem('ntfy_pinged', '1')

      visitNumber = Number(localStorage.getItem('ntfy_visits') ?? '0') + 1
      localStorage.setItem('ntfy_visits', String(visitNumber))
    } catch {
      // Storage blocked (private window, cookies off). Notify anyway rather
      // than losing the visit, and accept that dedup and the counter are gone.
    }

    const params = new URLSearchParams(location.search)
    const gclid = params.get('gclid') ?? params.get('gbraid') ?? params.get('wbraid')
    const paid = Boolean(gclid)

    const utm = [
      params.get('utm_source'),
      params.get('utm_medium'),
      params.get('utm_campaign'),
    ].filter(Boolean)

    const page = location.pathname === '/' ? '/ (Home)' : location.pathname + location.search
    const returning = visitNumber > 1

    let sent = false
    const send = (locationLine: string, network?: string) => {
      if (sent) return
      sent = true

      const lines = [
        `Page: ${page}`,
        `Source: ${paid ? 'Google Ads (paid click)' : referrerLabel(document.referrer)}`,
        utm.length ? `Campaign: ${utm.join(' / ')}` : null,
        locationLine,
        network ? `Network: ${network}` : null,
        `Device: ${isMobile() ? 'Mobile' : 'Desktop'} - ${platformName()} - ${browserName()}`,
        `Screen: ${window.screen.width}x${window.screen.height}${effectiveType() ? ` - ${effectiveType()}` : ''}`,
        `Language: ${navigator.language || 'unknown'}`,
        `Visit: ${ordinal(visitNumber)} from this browser`,
        `Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`,
      ].filter((line): line is string => line !== null)

      // ntfy headers must be ASCII, so the title stays plain and every accented
      // or emoji character lives in the body.
      const title = paid
        ? 'Paid click - Cibara Comforts'
        : `${returning ? 'Returning' : 'New'} visitor - Cibara Comforts`

      fetch(`https://ntfy.sh/${TOPIC}`, {
        method: 'POST',
        keepalive: true,
        headers: {
          Title: title,
          // A paid visit costs money, so it is worth interrupting for.
          Priority: paid ? '4' : '3',
          Tags: paid ? 'money_with_wings' : returning ? 'repeat' : 'wave',
          Click: location.href,
        },
        body: lines.join('\n'),
      }).catch(() => {
        // Offline, blocked by an extension, or ntfy is down. Nothing to do.
      })
    }

    // The geo lookup is best effort. If it is slow, blocked or rate limited,
    // the notification still goes out on this timer with location omitted.
    const timer = window.setTimeout(() => send('Location: unknown'), 1800)

    fetch('https://ipapi.co/json/')
      .then((r) => r.json() as Promise<GeoResponse>)
      .then((geo) => {
        window.clearTimeout(timer)
        if (!geo || geo.error) return send('Location: unknown')
        const where = [geo.city, geo.region, geo.country_name].filter(Boolean).join(', ')
        const emoji = flag(geo.country_code)
        send(`Location: ${where || 'unknown'}${emoji ? ` ${emoji}` : ''}`, geo.org)
      })
      .catch(() => {
        window.clearTimeout(timer)
        send('Location: unknown')
      })

    return () => window.clearTimeout(timer)
  }, [])

  return null
}
