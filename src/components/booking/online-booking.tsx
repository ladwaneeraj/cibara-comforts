'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import { WhatsAppAction } from '@/components/booking/actions'
import { useBookingGate } from '@/components/booking/use-booking-gate'

/**
 * The form, its Radix listbox and the date logic are fetched only when the ERP
 * says online booking is on. While it is off, or unreachable, none of that
 * ships to the guest's browser.
 */
const OnlineBookingForm = dynamic(
  () => import('@/components/booking/online-booking-form').then((m) => m.OnlineBookingForm),
  { ssr: false, loading: () => null },
)

/**
 * Online booking, behind the ERP's kill-switch.
 *
 * THE GATE. On load this asks `GET /web/config` whether online booking is on,
 * and renders the pay flow only on an explicit `online_bookings_enabled: true`.
 * Anything else is "paused": the flag being false, the request failing, a
 * timeout, an unparseable answer, or NEXT_PUBLIC_API_BASE not being set at
 * build time. Failing closed is the point. A booking widget that guesses "open"
 * when it cannot reach the ERP would let a guest pay for a room nobody can
 * confirm.
 *
 * The server also enforces the flag on every endpoint (403 `{enabled: false}`),
 * and the form hands that back through `onDisabled`, so a switch flipped while
 * a guest has the page open closes the flow under them as well.
 *
 * The paused state is the existing WhatsApp enquiry, unchanged. Booking has
 * always been a conversation on WhatsApp; this is an addition to that, never a
 * replacement.
 */
export function OnlineBooking({ roomSlug, source }: { roomSlug?: string; source: string }) {
  // The flag comes from the shared gate (one /web/config for the whole page).
  // `closed` is the local override for a switch flipped while the guest has the
  // page open: the form's hold/order 403s and calls onDisabled.
  const fetched = useBookingGate()
  const [closed, setClosed] = useState(false)
  const pause = useCallback(() => setClosed(true), [])
  const gate = closed ? 'paused' : fetched

  // When the guest taps "Book online" (a #book-online anchor) the native scroll
  // fires before this form has lazy-loaded, so it undershoots as the content
  // grows. Once the form is ready, re-align to the section — once, and only if
  // they actually navigated here.
  const aligned = useRef(false)
  useEffect(() => {
    if (gate !== 'open' || aligned.current) return
    if (typeof window !== 'undefined' && window.location.hash === '#book-online') {
      aligned.current = true
      requestAnimationFrame(() =>
        document.getElementById('book-online')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      )
    }
  }, [gate])

  if (gate === 'checking') {
    // Reserve roughly the height of the paused panel so the page below does
    // not jump when the answer arrives.
    return (
      <div
        aria-busy
        className="min-h-40 rounded-[var(--radius-card)] border border-line bg-paper p-7 text-[0.9375rem] text-ink-mute"
      >
        Checking online booking
      </div>
    )
  }

  if (gate === 'paused') {
    return (
      <div className="rounded-[var(--radius-card)] border border-line bg-paper p-7 lg:p-8" role="status">
        <p className="text-[length:var(--text-h3)] font-display text-ink">
          Online booking paused — message us on WhatsApp
        </p>
        <p className="mt-3 max-w-[56ch] text-[0.9375rem] leading-relaxed text-ink-soft">
          We are not taking online payments right now. Tell us your dates on WhatsApp and reception
          will confirm a room, usually within a few minutes.
        </p>
        <WhatsAppAction
          source={`${source}_paused`}
          enquiry={{ roomSlug, source: `${source}_paused` }}
          size="lg"
          className="mt-6 w-full sm:w-auto"
        >
          Message us on WhatsApp
        </WhatsAppAction>
      </div>
    )
  }

  return <OnlineBookingForm roomSlug={roomSlug} source={source} onDisabled={pause} />
}
