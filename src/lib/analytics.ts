/**
 * Analytics.
 *
 * The honest trade-off: Google Analytics, Clarity and the Meta Pixel together
 * add roughly 150 to 250 KB of third-party JavaScript and reliably cost 15 to
 * 30 Lighthouse performance points on a mid-range Android. You cannot have
 * both a Lighthouse 100 and three tag managers loading eagerly.
 *
 * The compromise implemented here: nothing loads during the critical path.
 * Tags boot on the first real user interaction, or after the browser goes
 * idle, whichever comes first. Bounced visitors cost nothing, Core Web Vitals
 * are measured on an unloaded page, and engaged sessions are still tracked.
 * Lighthouse, which never interacts, sees a clean page.
 *
 * Every id is read from an environment variable. Leave one unset and that tag
 * is simply never loaded.
 */

export const ANALYTICS = {
  ga4: process.env.NEXT_PUBLIC_GA4_ID,
  clarity: process.env.NEXT_PUBLIC_CLARITY_ID,
  metaPixel: process.env.NEXT_PUBLIC_META_PIXEL_ID,
} as const

export const HAS_ANALYTICS = Object.values(ANALYTICS).some(Boolean)

/** Conversion and engagement events. Keep this list closed so reporting stays clean. */
export type AnalyticsEvent =
  | { name: 'whatsapp_click'; params: { source: string; room?: string } }
  | { name: 'call_click'; params: { source: string } }
  | { name: 'directions_click'; params: { source: string } }
  | { name: 'enquiry_submit'; params: { source: string; room?: string; nights?: number } }
  | { name: 'room_view'; params: { room: string } }
  | { name: 'gallery_open'; params: { image: string } }
  | { name: 'faq_open'; params: { question: string } }
  | { name: 'scroll_depth'; params: { percent: 25 | 50 | 75 | 100 } }

type Gtag = (...args: unknown[]) => void
type Fbq = (...args: unknown[]) => void

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: Gtag
    fbq?: Fbq
    clarity?: (...args: unknown[]) => void
  }
}

/**
 * Fires an event to whichever tags happen to be loaded.
 * Safe to call before the tags boot: gtag's queue absorbs early calls, and the
 * others are no-ops until present.
 */
export function track(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return

  window.dataLayer?.push({ event: event.name, ...event.params })
  window.gtag?.('event', event.name, event.params)

  // Map the two events that matter to Meta's standard event names so ad
  // optimisation has something to bid against.
  if (event.name === 'whatsapp_click' || event.name === 'enquiry_submit') {
    window.fbq?.('track', 'Lead', event.params)
  }
  if (event.name === 'call_click') {
    window.fbq?.('track', 'Contact', event.params)
  }
}
