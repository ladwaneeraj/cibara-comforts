import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { DeferredAnalytics } from '@/components/analytics/deferred-analytics'
import { VisitNotification } from '@/components/analytics/visit-notification'
import { StickyDock } from '@/components/booking/sticky-dock'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import { THEME_SCRIPT } from '@/components/layout/theme-toggle'
import { REVEAL_SCRIPT } from '@/components/motion/reveal'
import { SmoothScroll } from '@/components/motion/smooth-scroll'
import { HOTEL, SITE_URL } from '@/content/hotel'
import { hotelNode, jsonLdGraph, websiteNode } from '@/lib/schema'
import { DEFAULT_OG, TITLE_TEMPLATE } from '@/lib/seo'
import { fraunces, inter } from './fonts'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${HOTEL.name} | Budget Hotel & Lodge in Harihar, Karnataka`,
    template: TITLE_TEMPLATE,
  },
  description: `Owner-run lodge 800m from Harihar railway station. AC and non-AC rooms and dorm beds from ₹250. 4.6★, ${HOTEL.rating.count} reviews. 24h reception, free parking.`,
  applicationName: HOTEL.name,
  authors: [{ name: HOTEL.name, url: SITE_URL }],
  creator: HOTEL.name,
  publisher: HOTEL.name,
  category: 'travel',
  // GitHub Pages cannot send response headers, so the referrer policy is set
  // here. See docs/DEPLOYMENT.md for the full header set to apply at the CDN.
  referrer: 'strict-origin-when-cross-origin',
  formatDetection: { telephone: true, address: true, email: true },
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    siteName: HOTEL.name,
    locale: 'en_IN',
    url: SITE_URL,
    images: [{ url: DEFAULT_OG, width: 1200, height: 630, alt: `${HOTEL.name}, Harihar` }],
  },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '48x48' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  other: {
    'geo.region': 'IN-KA',
    'geo.placename': 'Harihar',
    'geo.position': `${HOTEL.geo.lat};${HOTEL.geo.lng}`,
    ICBM: `${HOTEL.geo.lat}, ${HOTEL.geo.lng}`,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbf9f5' },
    { media: '(prefers-color-scheme: dark)', color: '#121914' },
  ],
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
  // Zoom is never disabled. Capping user-scalable is a WCAG 1.4.4 failure and
  // a genuine problem for the older guests who visit the temple.
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Both run before paint: the first so the dark theme never flashes,
            the second so the scroll-reveal fallback is registered before any
            content is hidden. Inlined rather than fetched, because a network
            round trip would defeat the point of either. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: REVEAL_SCRIPT }} />
        {/* The Hotel and WebSite entities appear on every page so that any
            landing page can be resolved to the same business. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdGraph(hotelNode(), websiteNode()) }}
        />
      </head>
      <body className="min-h-svh antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-paper"
        >
          Skip to content
        </a>

        <SmoothScroll />
        <Header />

        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>

        <Footer />
        <StickyDock />
        <DeferredAnalytics />
        <VisitNotification />
      </body>
    </html>
  )
}
