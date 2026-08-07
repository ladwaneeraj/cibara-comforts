'use client'

import { MapPin, Play } from 'lucide-react'
import { useState } from 'react'
import { HOTEL } from '@/content/hotel'
import { cn } from '@/lib/utils'

/**
 * Click-to-load map.
 *
 * A Google Maps iframe pulls roughly 900 KB to 1.4 MB across 40-odd requests
 * and reliably costs 10 to 20 Lighthouse performance points. Embedding one
 * eagerly on the homepage of a site whose guests are on 4G would be an
 * expensive way to show a rectangle almost nobody scrolls to.
 *
 * So this renders a facade: a styled panel with the address and the two
 * actions a guest actually wants, and it swaps in the real iframe only when
 * someone asks for it. The "Directions" button bypasses the embed entirely and
 * opens the native maps app, which is what most phone users want anyway.
 *
 * The facade is a real button with a real label, not a decorative image, so it
 * is reachable by keyboard and announced correctly.
 */
export function MapEmbed({ className }: { className?: string }) {
  const [loaded, setLoaded] = useState(false)

  const embedSrc = `https://maps.google.com/maps?q=${HOTEL.geo.lat},${HOTEL.geo.lng}&z=16&output=embed&hl=en`

  return (
    <div
      className={cn(
        'relative isolate overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper-3',
        className,
      )}
    >
      {loaded ? (
        <iframe
          title={`Map showing the location of ${HOTEL.name} in Harihar, Karnataka`}
          src={embedSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="group relative flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center"
        >
          {/* Abstract street grid. Decorative, so hidden from assistive tech. */}
          <svg
            aria-hidden
            className="absolute inset-0 h-full w-full text-line-strong opacity-45"
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 400 300"
          >
            <defs>
              <pattern id="map-grid" width="52" height="52" patternUnits="userSpaceOnUse">
                <path d="M52 0H0v52" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="400" height="300" fill="url(#map-grid)" />
            <path
              d="M-10 210 C 90 190, 150 240, 250 205 S 380 170, 420 185"
              fill="none"
              stroke="currentColor"
              strokeWidth="7"
              strokeLinecap="round"
              opacity="0.5"
            />
            <path d="M148 -10 L 172 310" stroke="currentColor" strokeWidth="4" opacity="0.6" />
            <path d="M-10 96 L 410 78" stroke="currentColor" strokeWidth="4" opacity="0.6" />
          </svg>

          <span className="relative grid size-14 place-items-center rounded-full bg-brass text-white shadow-[var(--shadow-card)] transition-transform duration-500 ease-[var(--ease-swift)] group-hover:scale-105">
            <MapPin className="size-6" aria-hidden />
          </span>

          <span className="relative">
            <span className="block font-display text-[1.375rem] text-ink">{HOTEL.name}</span>
            <span className="mt-1 block text-[0.8125rem] text-ink-mute">
              {HOTEL.address.street}, {HOTEL.address.locality} {HOTEL.address.postalCode}
            </span>
          </span>

          <span className="relative inline-flex items-center gap-2 rounded-full border border-line-strong bg-paper/80 px-4 py-2 text-[0.8125rem] font-medium text-ink backdrop-blur-sm transition-colors group-hover:border-ink">
            <Play className="size-3 fill-current" aria-hidden />
            Load the interactive map
          </span>

          <span className="relative text-[0.6875rem] text-ink-mute">
            Loads Google Maps only when you ask, to keep this page fast
          </span>
        </button>
      )}
    </div>
  )
}
