'use client'

import { ChevronDown, Users } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useId, useState } from 'react'
import { WhatsAppAction } from '@/components/booking/actions'
import { DateTrigger } from '@/components/booking/date-trigger'
import { ROOMS, formatINR } from '@/content/rooms'
import { track } from '@/lib/analytics'
import { estimateTotal, type Enquiry } from '@/lib/booking'
import { addDaysISO, nightsBetween, useClientToday } from '@/lib/dates'
import { cn } from '@/lib/utils'

/**
 * The calendar and its Radix Popover are fetched on intent, not on hydration.
 *
 * Two things were learned getting here, both by measurement.
 *
 * First, an approximate loading skeleton is worse than no lazy loading: the
 * swap moved the row beneath it, cost 0.055 CLS, and the shift reset the LCP
 * measurement. So the booking bar renders the real trigger markup itself,
 * statically, at final size, and the interactive copy lays over it.
 *
 * Second, a plain `dynamic()` still fires its import during hydration, which
 * on a throttled phone competes with everything else on the homepage's
 * critical path. Mounting only on hover or first tap moves that cost to a
 * moment when the guest has already declared intent, and preloading on hover
 * means the tap itself still feels instant.
 */
const DateRangeField = dynamic(
  () => import('@/components/booking/date-range-field').then((m) => m.DateRangeField),
  { ssr: false, loading: () => null },
)

/**
 * The booking widget.
 *
 * Design brief was "booking in under thirty seconds". Three inputs, pre-filled
 * with tonight and tomorrow, so the zero-interaction path is a single tap.
 *
 * Dates are one field, not two. Two separate date boxes make a guest think
 * about check-in and check-out as unrelated facts; a single range field
 * matches how people actually describe a stay and surfaces the night count,
 * which is the number that drives the price.
 *
 * There is no availability call because there is no availability system. The
 * copy says "we will confirm in minutes" instead of showing a fabricated green
 * tick. See lib/booking.ts.
 */
export function BookingBar({
  roomSlug,
  source,
  className,
  variant = 'panel',
}: {
  /** Locks the widget to one room. Omit to show the room selector. */
  roomSlug?: string
  source: string
  className?: string
  variant?: 'panel' | 'inline'
}) {
  const uid = useId()
  // Empty during hydration, then the real date. See lib/dates.ts.
  const today = useClientToday()

  const [chosen, setChosen] = useState<{ checkIn: string; checkOut: string } | null>(null)
  const range = chosen ??
    (today ? { checkIn: today, checkOut: addDaysISO(today, 1) } : { checkIn: '', checkOut: '' })
  const setRange = setChosen
  const [guests, setGuests] = useState(2)
  const [room, setRoom] = useState(roomSlug ?? '')

  // 'idle' until the guest shows intent. Hovering preloads the chunk; tapping
  // mounts it already open, so the tap is not swallowed.
  //
  // Warming happens on pointer only, never on focus: swapping the button out
  // from under a keyboard user would drop their focus to the body. On the
  // keyboard path the click handler mounts it with autoOpen, and Radix moves
  // focus into the calendar, so focus is carried rather than lost.
  const [calendar, setCalendar] = useState<'idle' | 'ready' | 'opening'>('idle')
  const warm = () => setCalendar((c) => (c === 'idle' ? 'ready' : c))

  const enquiry: Enquiry = {
    checkIn: range.checkIn,
    checkOut: range.checkOut,
    guests,
    roomSlug: room || undefined,
    source,
  }

  const estimate = estimateTotal(enquiry)
  const nights = nightsBetween(range.checkIn, range.checkOut)

  const selectClass =
    'peer h-full min-h-[3.5rem] w-full appearance-none bg-transparent pt-5 pr-6 pb-1.5 text-[0.9375rem] text-ink outline-none sm:min-h-[3.75rem] sm:pt-6 sm:pb-2'
  const labelClass =
    'pointer-events-none absolute top-1.5 left-0 flex items-center gap-1.5 text-[0.625rem] font-medium tracking-[0.14em] text-ink-mute uppercase sm:top-2 sm:text-[0.6875rem]'

  return (
    <div
      className={cn(
        variant === 'panel' && [
          'rounded-[var(--radius-panel)] border border-line bg-paper/85 p-3 shadow-[var(--shadow-lift)]',
          'backdrop-blur-xl sm:p-4',
        ],
        variant === 'inline' && 'rounded-[var(--radius-card)] border border-line bg-paper-2 p-3 sm:p-4',
        className,
      )}
    >
      <div
        className={cn(
          // Dates take a full row of their own, guests and room share the row
          // below. Three stacked full-width fields ate the mobile fold.
          'grid grid-cols-2 gap-px overflow-hidden rounded-[calc(var(--radius-card)-2px)] bg-line',
          roomSlug
            ? 'sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]'
            : 'lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.7fr)_minmax(0,1fr)]',
        )}
      >
        {/* The static trigger is always in the DOM at its final size. The
            interactive one renders on top of it once the chunk arrives, so
            there is no reflow and no dead zone in between. */}
        <div
          className={cn(
            'relative bg-paper',
            roomSlug ? 'col-span-2 sm:col-span-1' : 'col-span-2 lg:col-span-1',
          )}
        >
          {calendar === 'idle' || !today ? (
            <DateTrigger
              checkIn={range.checkIn}
              checkOut={range.checkOut}
              onPointerEnter={warm}
              onTouchStart={warm}
              onClick={() => setCalendar('opening')}
            />
          ) : (
            <DateRangeField
              checkIn={range.checkIn}
              checkOut={range.checkOut}
              onChange={setRange}
              autoOpen={calendar === 'opening'}
            />
          )}
        </div>

        <div className="relative bg-paper px-4">
          <label htmlFor={`${uid}-guests`} className={labelClass}>
            <Users className="size-3" aria-hidden />
            Guests
          </label>
          <select
            id={`${uid}-guests`}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className={selectClass}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'guest' : 'guests'}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 bottom-3 size-4 text-ink-mute"
            aria-hidden
          />
        </div>

        {!roomSlug && (
          <div className="relative bg-paper px-4">
            <label htmlFor={`${uid}-room`} className={labelClass}>
              Room
            </label>
            <select
              id={`${uid}-room`}
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className={selectClass}
            >
              <option value="">Any room</option>
              {ROOMS.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.shortName} · {formatINR(r.price)}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 bottom-3 size-4 text-ink-mute"
              aria-hidden
            />
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Constant copy until the guest picks a room, deliberately.
            An earlier version echoed the chosen dates here, which meant the
            line grew by a whole row the moment the client resolved today's
            date, pushing the hero taller and costing 0.127 CLS on a phone. The
            dates are already stated in the field above; repeating them bought
            nothing and cost the score. The estimate below only appears after a
            deliberate room selection, and shifts within 500ms of user input do
            not count against CLS. */}
        <p className="text-caption text-ink-mute" aria-live="polite">
          {estimate ? (
            <>
              <span className="font-medium text-ink tnum">{formatINR(estimate.total)}</span> estimated
              for {estimate.nights} night{estimate.nights > 1 ? 's' : ''}.{' '}
              <span className="hidden sm:inline">{estimate.breakdown}. </span>Nothing is charged now.
            </>
          ) : (
            'Nothing is charged now, and you can cancel free until 24 hours before.'
          )}
        </p>

        <WhatsAppAction
          source={source}
          enquiry={enquiry}
          size="lg"
          variant="primary"
          className="w-full shrink-0 sm:w-auto"
          onClick={() =>
            track({
              name: 'enquiry_submit',
              params: { source, room: room || undefined, nights },
            })
          }
        >
          Check availability
        </WhatsAppAction>
      </div>
    </div>
  )
}
