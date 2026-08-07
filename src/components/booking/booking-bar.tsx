'use client'

import { CalendarDays, ChevronDown, Users } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { WhatsAppAction } from '@/components/booking/actions'
import { ROOMS, formatINR } from '@/content/rooms'
import { track } from '@/lib/analytics'
import { estimateTotal, type Enquiry } from '@/lib/booking'
import { addDays, cn, isoDate, nights } from '@/lib/utils'

/**
 * The booking widget.
 *
 * Design brief was "booking in under thirty seconds". The three fields below
 * are the minimum a human at reception needs to hold a room, pre-filled with
 * tonight and tomorrow so the zero-interaction path is a single tap.
 *
 * Native `<input type="date">` rather than a custom calendar. A React date
 * picker with a decent accessibility story costs 25 to 40 KB and still loses
 * to the OS picker on a phone, which is where nearly all of this traffic is.
 * The native control is keyboard accessible, screen-reader labelled, localised
 * and free.
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
  const today = isoDate(new Date())
  const tomorrow = isoDate(addDays(new Date(), 1))

  const [checkIn, setCheckIn] = useState(today)
  const [checkOut, setCheckOut] = useState(tomorrow)
  const [guests, setGuests] = useState(2)
  const [room, setRoom] = useState(roomSlug ?? '')

  // Check-out can never be on or before check-in.
  const minCheckOut = useMemo(() => isoDate(addDays(new Date(`${checkIn}T00:00:00`), 1)), [checkIn])
  const invalidRange = nights(checkIn, checkOut) < 1

  const enquiry: Enquiry = {
    checkIn,
    checkOut: invalidRange ? minCheckOut : checkOut,
    guests,
    roomSlug: room || undefined,
    source,
  }

  const estimate = estimateTotal(enquiry)

  const fieldClass =
    'peer h-full min-h-[3.25rem] w-full appearance-none bg-transparent pt-5 pb-1.5 text-[0.9375rem] text-ink outline-none [color-scheme:light] dark:[color-scheme:dark] sm:min-h-[3.75rem] sm:pt-6 sm:pb-2'
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
      {/* Two rows on a phone, one on a laptop. Four stacked fields ate the
          entire mobile fold and pushed the primary action below it. */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[calc(var(--radius-card)-2px)] bg-line sm:grid-cols-[1fr_1fr_auto] lg:grid-cols-[1fr_1fr_auto_auto]">
        {/* Check in */}
        <div className="relative bg-paper px-4">
          <label htmlFor={`${uid}-in`} className={labelClass}>
            <CalendarDays className="size-3" aria-hidden />
            Check in
          </label>
          <input
            id={`${uid}-in`}
            type="date"
            value={checkIn}
            min={today}
            onChange={(e) => {
              setCheckIn(e.target.value)
              if (nights(e.target.value, checkOut) < 1) {
                setCheckOut(isoDate(addDays(new Date(`${e.target.value}T00:00:00`), 1)))
              }
            }}
            className={fieldClass}
          />
        </div>

        {/* Check out */}
        <div className="relative bg-paper px-4">
          <label htmlFor={`${uid}-out`} className={labelClass}>
            <CalendarDays className="size-3" aria-hidden />
            Check out
          </label>
          <input
            id={`${uid}-out`}
            type="date"
            value={checkOut}
            min={minCheckOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className={fieldClass}
          />
        </div>

        {/* Guests */}
        <div className="relative bg-paper px-4 lg:min-w-[9rem]">
          <label htmlFor={`${uid}-guests`} className={labelClass}>
            <Users className="size-3" aria-hidden />
            Guests
          </label>
          <select
            id={`${uid}-guests`}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className={cn(fieldClass, 'pr-6')}
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

        {/* Room, only when not locked to one */}
        {!roomSlug && (
          <div className="relative bg-paper px-4 lg:min-w-[13rem]">
            <label htmlFor={`${uid}-room`} className={labelClass}>
              Room
            </label>
            <select
              id={`${uid}-room`}
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className={cn(fieldClass, 'pr-6')}
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
        <p className="text-caption text-ink-mute" aria-live="polite">
          {estimate ? (
            <>
              <span className="font-medium text-ink tnum">{formatINR(estimate.total)}</span> estimated
              for {estimate.nights} night{estimate.nights > 1 ? 's' : ''}.{' '}
              <span className="hidden sm:inline">{estimate.breakdown}. </span>Nothing is charged now.
            </>
          ) : (
            <>Pick your dates. Nothing is charged now, and you can cancel free until 24 hours before.</>
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
              params: { source, room: room || undefined, nights: nights(checkIn, checkOut) },
            })
          }
        >
          Check availability
        </WhatsAppAction>
      </div>
    </div>
  )
}
