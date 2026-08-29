'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { ANALYTICS, ensureGtag, HAS_ANALYTICS } from '@/lib/analytics'

/**
 * Analytics loader.
 *
 * Tags boot on the first genuine interaction, or when the browser goes idle,
 * whichever happens first. See lib/analytics.ts for why. The practical effect:
 *
 *   - Lighthouse, which never interacts and never idles long enough on a cold
 *     run, measures a page with no third-party JavaScript at all.
 *   - A real visitor who scrolls or taps gets tracked within a frame or two.
 *   - A visitor who bounces in under a second costs nothing, which is also the
 *     visitor whose data was never useful.
 *
 * Scroll-depth reporting is attached here rather than in a separate component
 * so there is exactly one scroll listener for analytics on the page.
 */
export function DeferredAnalytics() {
  const [boot, setBoot] = useState(false)

  // Install the gtag command queue at hydration, long before anyone can click.
  // Deferring the *network* load is the performance win; deferring the queue as
  // well would drop the first conversion. See ensureGtag in lib/analytics.ts.
  useEffect(() => {
    ensureGtag()
  }, [])

  useEffect(() => {
    if (boot) return
    if (!HAS_ANALYTICS) return

    let done = false
    const start = () => {
      if (done) return
      done = true
      setBoot(true)
      cleanup()
    }

    const events: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'scroll', 'touchstart']
    const cleanup = () => {
      for (const event of events) window.removeEventListener(event, start)
      if (idle) cancelIdle(idle)
    }
    for (const event of events) window.addEventListener(event, start, { once: true, passive: true })

    // Backstop for genuinely passive readers.
    const requestIdle =
      window.requestIdleCallback ?? ((cb: IdleRequestCallback) => window.setTimeout(cb, 4000))
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout
    const idle = requestIdle(start, { timeout: 8000 }) as number

    return cleanup
  }, [boot])

  // Scroll depth. Independent of tag load: track() queues safely.
  useEffect(() => {
    const marks = new Set<number>()
    const onScroll = () => {
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - window.innerHeight
      if (scrollable <= 0) return
      const percent = Math.round((window.scrollY / scrollable) * 100)
      for (const mark of [25, 50, 75, 100] as const) {
        if (percent >= mark && !marks.has(mark)) {
          marks.add(mark)
          window.dataLayer?.push({ event: 'scroll_depth', percent: mark })
          window.gtag?.('event', 'scroll_depth', { percent: mark })
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!boot) return null

  // One gtag.js load serves both GA4 and Google Ads: the library is keyed by
  // the id in the URL but replays every `config` already sitting in the queue,
  // and ensureGtag has queued both. Either id can therefore front the request.
  // `||` rather than `??` on purpose: belt and braces against an id that
  // slipped through as an empty string. See id() in lib/analytics.ts.
  const gtagId = ANALYTICS.ga4 || ANALYTICS.googleAds

  return (
    <>
      {gtagId && (
        <Script
          id="gtag-src"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`}
        />
      )}

      {ANALYTICS.clarity && (
        <Script id="clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${ANALYTICS.clarity}");`}
        </Script>
      )}

      {ANALYTICS.metaPixel && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');fbq('init','${ANALYTICS.metaPixel}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  )
}
