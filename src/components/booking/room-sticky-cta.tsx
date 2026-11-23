'use client'

import { ArrowRight, MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useBookingGate } from '@/components/booking/use-booking-gate'
import { track } from '@/lib/analytics'
import { whatsappUrl } from '@/lib/booking'
import { formatINR } from '@/content/rooms'
import { cn } from '@/lib/utils'

/**
 * Mobile sticky booking bar for a bookable room page.
 *
 * Keeps the money action one thumb-tap away the whole way down the page —
 * the pattern every hotel app uses. It replaces the generic contact dock on
 * these pages (see sticky-dock.tsx, which hides its mobile bar here), so it
 * carries a WhatsApp shortcut too, and leads with price + "Book online".
 *
 * It appears once the guest scrolls past the hero and hides again while the
 * #book-online form itself is on screen — no point offering a jump to the
 * thing you are already looking at. When online booking is paused it falls
 * back to a WhatsApp enquiry rather than pushing people at a dead form.
 */
export function RoomStickyCta({ roomSlug, price }: { roomSlug: string; price: number }) {
  const gate = useBookingGate()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const form = document.getElementById('book-online')
    const onScroll = () => {
      const pastHero = window.scrollY > window.innerHeight * 0.5
      const formOnScreen = form
        ? (() => {
            const r = form.getBoundingClientRect()
            return r.top < window.innerHeight * 0.85 && r.bottom > 0
          })()
        : false
      setShow(pastHero && !formOnScreen)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const online = gate === 'open'

  return (
    <div
      className={cn(
        'no-print fixed inset-x-0 bottom-0 z-50 lg:hidden',
        'border-t border-line bg-paper/92 backdrop-blur-xl',
        'pb-[env(safe-area-inset-bottom)]',
        'transition-transform duration-500 ease-[var(--ease-swift)]',
        show ? 'translate-y-0' : 'translate-y-full',
      )}
    >
      <div className="container-page flex items-center gap-3 py-2.5">
        <a
          href={whatsappUrl({ roomSlug, source: 'room_sticky' })}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Message us on WhatsApp"
          onClick={() => track({ name: 'whatsapp_click', params: { source: 'room_sticky', room: roomSlug } })}
          className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-[#0F7D42] dark:text-[#5FD98C]"
        >
          <MessageCircle className="size-5" aria-hidden />
        </a>

        <div className="leading-tight">
          <p className="font-display text-[1.0625rem] text-ink tnum">{formatINR(price)}</p>
          <p className="text-[0.625rem] text-ink-mute">per night · taxes included</p>
        </div>

        {online ? (
          <a
            href="#book-online"
            onClick={() => track({ name: 'book_online_click', params: { source: 'room_sticky', room: roomSlug } })}
            className="ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-brass px-6 text-[0.9375rem] font-medium text-white dark:text-forest-2"
          >
            Book online
            <ArrowRight className="size-4" aria-hidden />
          </a>
        ) : (
          <a
            href={whatsappUrl({ roomSlug, source: 'room_sticky_paused' })}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-[#0F7D42] px-6 text-[0.9375rem] font-medium text-white"
          >
            Check availability
            <ArrowRight className="size-4" aria-hidden />
          </a>
        )}
      </div>
    </div>
  )
}
