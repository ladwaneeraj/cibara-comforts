'use client'

import { ArrowRight, BedDouble, CalendarDays, Clock, Hourglass, Loader2, MessageCircle, Users } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { WhatsAppAction, WhatsAppTextLink } from '@/components/booking/actions'
import { SelectField, type SelectOption } from '@/components/booking/select-field'
import { Button } from '@/components/ui/button'
import { ROOMS, formatINR } from '@/content/rooms'
import { HOTEL } from '@/content/hotel'
import {
  bookingApi,
  onlineCategory,
  ONLINE_ROOM_SLUGS,
  type ApiFailure,
  type Availability,
  type Hold,
  type Stay,
} from '@/lib/booking-api'
import { addDaysISO, formatShort, useClientToday } from '@/lib/dates'
import { loadRazorpay } from '@/lib/razorpay'
import { cn } from '@/lib/utils'

/**
 * The online booking form: stay, live price, guest details, Razorpay.
 *
 * The ERP decides everything that matters. The price shown is whatever
 * `/web/availability` returned; the form never computes one. Pay is disabled
 * unless the server said `available: true` for exactly the inputs on screen.
 *
 * THE INVARIANT: the browser never confirms a booking. Razorpay's `handler`
 * callback runs in the guest's browser and can be triggered, replayed or lost,
 * so it only moves this component to a "thank you, confirmation follows"
 * screen. The booking becomes confirmed when the ERP receives Razorpay's signed
 * webhook, and the guest is told so on WhatsApp. Nothing in this file calls an
 * endpoint on success, and dismissing the checkout calls nothing either: the
 * hold simply expires on the server.
 */

const field =
  'h-12 w-full rounded-[0.625rem] border border-line bg-paper px-4 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-mute focus:border-line-strong [color-scheme:light] dark:[color-scheme:dark]'
const label = 'block text-[0.6875rem] font-medium tracking-[0.14em] text-ink-mute uppercase'
const selectBox = 'overflow-hidden rounded-[0.625rem] border border-line'

/** Don't reuse a hold that is about to lapse mid-payment. */
const HOLD_MARGIN_MS = 60_000

type Phase = 'form' | 'working' | 'paying' | 'done'
type Outcome = { key: string; result: Availability } | { key: string; failure: ApiFailure }
type HeldBooking = Hold & { detailsKey: string }

const BOOKABLE_ROOMS = ROOMS.filter((r) => ONLINE_ROOM_SLUGS.includes(r.slug))

const DAY_OPTIONS: SelectOption[] = Array.from({ length: 30 }, (_, i) => i + 1).map((n) => ({
  value: String(n),
  label: `${n} ${n === 1 ? 'day' : 'days'}`,
  hint: `${n * 24} hours`,
}))

export function OnlineBookingForm({
  roomSlug,
  source,
  onDisabled,
}: {
  /** Preselects a room. Falls back to the first bookable room. */
  roomSlug?: string
  source: string
  /** The server said online booking is off. The gate flips to the paused state. */
  onDisabled: () => void
}) {
  const uid = useId()
  const today = useClientToday()

  const [slug, setSlug] = useState(
    roomSlug && onlineCategory(roomSlug) ? roomSlug : BOOKABLE_ROOMS[0].slug,
  )
  const room = onlineCategory(slug)!
  const roomName = BOOKABLE_ROOMS.find((r) => r.slug === slug)?.shortName ?? ''

  // Tomorrow by default: "today at noon" is often already in the past, and the
  // server rejects a check-in in the past.
  const defaultDate = today ? addDaysISO(today, 1) : ''
  const [dateChosen, setDateChosen] = useState<string | null>(null)
  const date = dateChosen ?? defaultDate
  const [time, setTime] = useState<string>(HOTEL.checkIn)
  const [daysChosen, setDaysChosen] = useState('1')
  const [guestsChosen, setGuestsChosen] = useState('2')
  const days = Number(daysChosen)
  const guests = Math.min(Number(guestsChosen), room.maxGuests)

  const [guestName, setGuestName] = useState('')
  const [guestMobile, setGuestMobile] = useState('')
  const [guestEmail, setGuestEmail] = useState('')

  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [phase, setPhase] = useState<Phase>('form')
  const [payError, setPayError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [reference, setReference] = useState<string | null>(null)
  const held = useRef<HeldBooking | null>(null)

  const guestOptions: SelectOption[] = Array.from({ length: room.maxGuests }, (_, i) => i + 1).map(
    (n) => ({ value: String(n), label: `${n} ${n === 1 ? 'guest' : 'guests'}` }),
  )
  const roomOptions: SelectOption[] = BOOKABLE_ROOMS.map((r) => ({ value: r.slug, label: r.shortName }))

  // The exact request body for these inputs, or null while they are incomplete.
  const stay = useMemo<Stay | null>(() => {
    if (!date || !today || date < today) return null
    if (!/^\d{2}:\d{2}$/.test(time)) return null
    return { category: room.category, check_in_date: date, check_in_time: time, days, guests }
  }, [date, today, time, room.category, days, guests])
  const key = stay ? JSON.stringify(stay) : ''

  // An availability answer belongs to the inputs that produced it. Deriving
  // "current" from the key means a stale price can never sit next to changed
  // inputs, not even for the frame before the new request starts.
  const current = outcome && outcome.key === key ? outcome : null
  const checking = stay !== null && current === null

  useEffect(() => {
    if (!stay) return
    const ctrl = new AbortController()
    // Debounced so that dragging through a list of days is one request, not ten.
    const timer = setTimeout(async () => {
      const res = await bookingApi.availability(stay, ctrl.signal)
      if (ctrl.signal.aborted) return
      if (res.ok) setOutcome({ key, result: res.data })
      else if (res.disabled) onDisabled()
      else setOutcome({ key, failure: res })
    }, 450)
    return () => {
      clearTimeout(timer)
      ctrl.abort()
    }
  }, [stay, key, onDisabled])

  const available = current && 'result' in current && current.result.available ? current.result : null

  function failWith(failure: ApiFailure, fallback?: string) {
    if (failure.disabled) {
      onDisabled()
      return
    }
    setPayError(
      failure.soldOut
        ? 'Sorry, those dates have just been taken. Try a different time, or ask us on WhatsApp.'
        : failure.status === 503
          ? 'We are busy for a moment. Please try again.'
          : (fallback ?? failure.message),
    )
    setPhase('form')
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!stay || !available || phase !== 'form') return

    setPhase('working')
    setPayError(null)
    setNotice(null)

    const guest = {
      guest_name: guestName.trim(),
      guest_mobile: guestMobile.trim(),
      ...(guestEmail.trim() ? { guest_email: guestEmail.trim() } : {}),
    }
    const detailsKey = `${key}|${guest.guest_name}|${guest.guest_mobile}|${guest.guest_email ?? ''}`

    // A guest who closed the checkout and taps Pay again gets the same hold,
    // and `/web/order` is idempotent, so the same order comes back. Reusing it
    // matters: with one room left in a category, a second hold would collide
    // with the guest's own first one and report sold out.
    const reusable =
      held.current &&
      held.current.detailsKey === detailsKey &&
      Date.parse(held.current.expires_at) - Date.now() > HOLD_MARGIN_MS
        ? held.current
        : null

    for (let attempt = 0; attempt < 2; attempt += 1) {
      let hold: HeldBooking | null = attempt === 0 ? reusable : null
      const reused = hold !== null

      if (!hold) {
        const res = await bookingApi.hold(stay, guest)
        if (!res.ok) return failWith(res)
        hold = { ...res.data, detailsKey }
        held.current = hold
      }

      // Never charge a different number from the one the guest agreed to.
      if (hold.amount !== available.price) {
        setOutcome({ key, result: { ...available, price: hold.amount } })
        setPayError(`The price is now ${formatINR(hold.amount)}. Please check it and tap Pay again.`)
        setPhase('form')
        return
      }

      const order = await bookingApi.order(hold.booking_id)
      if (!order.ok) {
        if (order.status === 404 && reused) {
          // The remembered hold had lapsed on the server. Start over, once.
          held.current = null
          continue
        }
        if (order.status === 404) held.current = null
        return failWith(
          order,
          order.status === 404
            ? 'Your reservation timed out. Please tap Pay to start again.'
            : order.status === 409
              ? 'This booking has already been paid. Check WhatsApp for your confirmation.'
              : undefined,
        )
      }

      if (order.data.amount !== Math.round(hold.amount * 100)) {
        setPayError(
          'We could not verify the amount for this payment, so nothing was started. Please message us on WhatsApp.',
        )
        setPhase('form')
        return
      }

      let Razorpay
      try {
        Razorpay = await loadRazorpay()
      } catch {
        setPayError('The payment window could not load. Check your connection and try again.')
        setPhase('form')
        return
      }

      const bookingId = hold.booking_id
      setPhase('paying')
      try {
        new Razorpay({
          key: order.data.key_id,
          order_id: order.data.order_id,
          amount: order.data.amount,
          currency: 'INR',
          name: HOTEL.name,
          description: `${roomName}, ${days} ${days === 1 ? 'day' : 'days'} from ${formatShort(stay.check_in_date)}`,
          prefill: {
            name: guest.guest_name,
            contact: guest.guest_mobile,
            ...(guest.guest_email ? { email: guest.guest_email } : {}),
          },
          // UX ONLY. This does not confirm anything. See the file comment.
          handler: () => {
            held.current = null
            setReference(bookingId.slice(0, 8).toUpperCase())
            setPhase('done')
          },
          // No client-side confirm and no cancel call: the hold expires itself.
          modal: {
            ondismiss: () => {
              setPhase((p) => (p === 'done' ? p : 'form'))
              setNotice(
                'The payment window was closed. Your room stays reserved for a few minutes, so you can tap Pay to continue. Otherwise it is released automatically.',
              )
            },
          },
        }).open()
      } catch {
        // A constructor or open() failure (bad key, SDK quirk) must not leave
        // the button stuck on "Payment window open". The hold is kept, so Pay
        // again reuses it.
        setPayError('The payment window could not open. Please tap Pay to try again, or message us on WhatsApp.')
        setPhase('form')
      }
      return
    }
  }

  if (phase === 'done') {
    return (
      <div className="rounded-[var(--radius-card)] border border-line bg-paper p-7 lg:p-8" role="status">
        <h3 className="text-[length:var(--text-h3)]">Thank you, we are confirming your booking</h3>
        <p className="mt-3 max-w-[56ch] text-[0.9375rem] leading-relaxed text-ink-soft">
          The payment window reported success. Your booking is confirmed once our system has
          received the payment confirmation from the bank, which normally takes under a minute. We
          will message you on WhatsApp at {guestMobile} with the confirmation and check-in details.
        </p>
        {reference && (
          <p className="mt-4 text-[0.8125rem] text-ink-mute">
            Reference <span className="font-medium text-ink tnum">{reference}</span>
          </p>
        )}
        <p className="mt-4 max-w-[56ch] text-[0.8125rem] leading-relaxed text-ink-mute">
          If you have not heard from us in a few minutes, message reception with this reference and
          we will check straight away.
        </p>
        <WhatsAppAction
          source={`${source}_paid`}
          enquiry={{
            roomSlug: slug,
            source: `${source}_paid`,
            note: reference ? `Booking reference: ${reference}` : undefined,
          }}
          size="lg"
          variant="primary"
          className="mt-6 w-full sm:w-auto"
        >
          Message reception
        </WhatsAppAction>
      </div>
    )
  }

  const busy = phase === 'working' || phase === 'paying'
  const failure = current && 'failure' in current ? current.failure : null

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[var(--radius-card)] border border-line bg-paper p-6 sm:p-7 lg:p-8"
      aria-busy={busy}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={selectBox}>
          <SelectField
            label="Room"
            icon={BedDouble}
            value={slug}
            options={roomOptions}
            onChange={setSlug}
          />
        </div>
        <div className={selectBox}>
          <SelectField
            label="Guests"
            icon={Users}
            value={String(guests)}
            options={guestOptions}
            onChange={setGuestsChosen}
          />
        </div>

        <div>
          <label htmlFor={`${uid}-date`} className={cn(label, 'flex items-center gap-1.5')}>
            <CalendarDays className="size-3" aria-hidden />
            Check-in date
          </label>
          <input
            id={`${uid}-date`}
            type="date"
            required
            min={today}
            value={date}
            onChange={(e) => setDateChosen(e.target.value)}
            className={cn(field, 'mt-2')}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-time`} className={cn(label, 'flex items-center gap-1.5')}>
            <Clock className="size-3" aria-hidden />
            Check-in time
          </label>
          <input
            id={`${uid}-time`}
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={cn(field, 'mt-2')}
          />
        </div>

        <div className={cn(selectBox, 'sm:col-span-2')}>
          <SelectField
            label="Length of stay"
            icon={Hourglass}
            value={daysChosen}
            options={DAY_OPTIONS}
            onChange={setDaysChosen}
          />
        </div>
      </div>

      <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-mute">
        A day is a 24 hour period from your check-in time, so checkout is at the same time on the
        last day.
        {stay && (
          <>
            {' '}
            You would check out on{' '}
            <span className="text-ink">
              {formatShort(addDaysISO(stay.check_in_date, stay.days))} at {stay.check_in_time}
            </span>
            .
          </>
        )}
      </p>

      {/* Availability and the server's price. This is the only price on the form. */}
      <div
        className="mt-6 rounded-[0.625rem] border border-line bg-paper-2 px-5 py-4"
        aria-live="polite"
      >
        {!stay ? (
          <p className="text-[0.9375rem] text-ink-mute">
            Choose today or a later date and a check-in time to see the price.
          </p>
        ) : checking ? (
          <p className="flex items-center gap-2 text-[0.9375rem] text-ink-mute">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Checking availability
          </p>
        ) : failure ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[0.9375rem] text-terracotta">{failure.message}</p>
            <WhatsAppTextLink source={`${source}_error`} enquiry={{ roomSlug: slug, source }}>
              Ask us on WhatsApp
            </WhatsAppTextLink>
          </div>
        ) : available ? (
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-display text-[1.75rem] leading-none text-ink tnum">
              {formatINR(available.price)}
            </span>
            <span className="text-[0.8125rem] text-ink-mute">
              total for {days} {days === 1 ? 'day' : 'days'}, available
            </span>
          </p>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[0.9375rem] text-ink">
              Sorry, the {roomName} is not available for those dates. Try a different time or room.
            </p>
            <WhatsAppTextLink source={`${source}_unavailable`} enquiry={{ roomSlug: slug, source }}>
              Ask us on WhatsApp
            </WhatsAppTextLink>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-name`} className={label}>
            Your name
          </label>
          <input
            id={`${uid}-name`}
            required
            autoComplete="name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            // Warm the payment script once the guest is committed enough to type.
            onFocus={() => void loadRazorpay().catch(() => {})}
            className={cn(field, 'mt-2')}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-mobile`} className={label}>
            Mobile number
          </label>
          <input
            id={`${uid}-mobile`}
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel"
            value={guestMobile}
            onChange={(e) => setGuestMobile(e.target.value)}
            placeholder="We confirm on WhatsApp"
            className={cn(field, 'mt-2')}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${uid}-email`} className={label}>
            Email <span className="normal-case opacity-70">(optional)</span>
          </label>
          <input
            id={`${uid}-email`}
            type="email"
            autoComplete="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            className={cn(field, 'mt-2')}
          />
        </div>
      </div>

      {payError && (
        <p role="alert" className="mt-5 text-[0.875rem] text-terracotta">
          {payError}
        </p>
      )}
      {notice && !payError && (
        <p role="status" className="mt-5 text-[0.875rem] text-ink-soft">
          {notice}
        </p>
      )}

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={!available || busy}>
        {busy ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            {phase === 'paying' ? 'Payment window open' : 'Reserving your room'}
          </>
        ) : (
          <>
            {available ? `Pay ${formatINR(available.price)}` : 'Pay'}
            <ArrowRight aria-hidden />
          </>
        )}
      </Button>

      {/* The one no-refund line. Final pay step only, deliberately understated. */}
      <p className="mt-3 text-center text-[0.75rem] text-ink-mute">Payments are non-refundable.</p>

      <p className="mt-5 flex items-start gap-2 border-t border-line pt-5 text-[0.8125rem] leading-relaxed text-ink-mute">
        <MessageCircle className="mt-0.5 size-3.5 shrink-0 text-brass" aria-hidden />
        <span>
          Prefer to talk first, or need a different room or dates?{' '}
          <WhatsAppTextLink source={`${source}_form`} enquiry={{ roomSlug: slug, source }}>
            Message reception on WhatsApp
          </WhatsAppTextLink>
          .
        </span>
      </p>
    </form>
  )
}
