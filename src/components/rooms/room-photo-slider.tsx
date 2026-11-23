'use client'

import { useRef, useState } from 'react'
import { Picture } from '@/components/media/picture'
import type { MediaId } from '@/content/generated/media'
import { cn } from '@/lib/utils'

/**
 * Swipeable room photo slider for the mobile hero.
 *
 * Native CSS scroll-snap — the browser does the swiping, momentum and snap, so
 * this ships almost no JavaScript and works without it (it degrades to a
 * horizontal scroll). The only JS is the active-dot indicator, derived from
 * the scroll position. First slide is `priority` for LCP; the rest lazy-load.
 */
export function RoomPhotoSlider({ photos }: { photos: { id: MediaId; alt: string }[] }) {
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  function onScroll() {
    const el = ref.current
    if (!el) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i !== active) setActive(i)
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((photo, i) => (
          <div key={photo.id} className="w-full shrink-0 snap-center">
            <Picture id={photo.id} alt={photo.alt} ratio="4 / 3" priority={i === 0} sizes="100vw" />
          </div>
        ))}
      </div>

      {photos.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
          {photos.map((photo, i) => (
            <span
              key={photo.id}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === active ? 'w-5 bg-white' : 'w-1.5 bg-white/55',
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
