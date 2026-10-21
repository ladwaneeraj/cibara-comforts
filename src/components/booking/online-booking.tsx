'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import { WhatsAppAction } from '@/components/booking/actions'
import { bookingApi } from '@/lib/booking-api'

/**
 * The form, its Radix listbox and the date logic are fetched only when the ERP
 * says online booking is on. While it is off, or unreachable, none of that
 * ships to the guest's browser.
 */
const OnlineBookingForm = dynamic(
  () => import('@/components/booking/online-booking-form').then((m) => m.OnlineBookingForm),
  { ssr: false, loading: () => null },
)

type Gate = 'checking' | 'open' | 'paused'

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
  const [gate, setGate] = useState<Gate>('checking')
  const pause = useCallback(() => setGate('paused'), [])

  useEffect(() => {
    const ctrl = new AbortController()
    bookingApi
      .config(ctrl.signal)
      .then((res) => (res.ok && res.data.online_bookings_enabled === true ? 'open' : 'paused'))
      // Whatever goes wrong, the answer is "paused", never a hung spinner.
      .catch((): Gate => 'paused')
      .then((next) => {
        if (!ctrl.signal.aborted) setGate(next)
      })
    return () => ctrl.abort()
  }, [])

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
