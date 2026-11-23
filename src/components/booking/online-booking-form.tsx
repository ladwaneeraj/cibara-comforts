'use client'

import { ArrowRight, Check, Copy, Loader2, MessageCircle, ShieldCheck, Sparkles, Star, Users } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { WhatsAppAction, WhatsAppTextLink } from '@/components/booking/actions'
import { ClockTimeField } from '@/components/booking/clock-time-field'
import { DateRangeField } from '@/components/booking/date-range-field'
import { SelectField, type SelectOption } from '@/components/booking/select-field'
import { Picture } from '@/components/media/picture'
import { Button } from '@/components/ui/button'
import { ROOMS, ROOMS_BY_SLUG, formatINR } from '@/content/rooms'
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
import { addDaysISO, formatShort, nightsBetween, nowTimeIST, useClientToday } from '@/lib/dates'
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
 *
 * The ERP sells 24-hour "days" from a check-in time, which for a guest is just
 * nights: one night is one 24h day with the same checkout time. So the UI is a
 * normal check-in → check-out range (the house calendar), and `days` sent to
 * the server is the night count.
 */

const field =
  'h-12 w-full rounded-[0.625rem] border border-line bg-paper px-4 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-mute focus:border-line-strong [color-scheme:light] dark:[color-scheme:dark]'
const label = 'block text-[0.6875rem] font-medium tracking-[0.14em] text-ink-mute uppercase'
const selectBox = 'overflow-hidden rounded-[0.625rem] border border-line'

/**
 * Round "HH:MM" up to the next :00/:30 so a same-day first slot is clean (no
 * 16:50). shortcut: a time past 23:30 clamps to 23:30 — a lodge check-in
 * booked online in that last half hour is a non-case; revisit if guests ask.
 */
function ceilHalfHour(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const total = Math.min(1410, Math.ceil((h * 60 + m) / 30) * 30)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

/** Don't reuse a hold that is about to lapse mid-payment. */
const HOLD_MARGIN_MS = 60_000

/**
 * The post-payment receipt is kept in the guest's own browser so a refresh, a
 * closed tab or a return visit still shows them their reference until the
 * WhatsApp confirmation lands — the thing people panic about. Local only;
 * nothing leaves the device, and it never claims the booking is confirmed.
 * shortcut: 48h TTL — bump it if guests report losing it before confirmation.
 */
type Receipt = { reference: string; mobile: string; ts: number }
const RECEIPT_KEY = 'cibara_booking_receipt'
const RECEIPT_TTL = 48 * 60 * 60 * 1000

function readReceipt(): Receipt | null {
  try {
    const r = JSON.parse(localStorage.getItem(RECEIPT_KEY) || 'null') as Receipt | null
    if (!r?.reference || Date.now() - r.ts > RECEIPT_TTL) {
      localStorage.removeItem(RECEIPT_KEY)
      return null
    }
    return r
  } catch {
    return null
  }
}
function saveReceipt(r: Receipt) {
  try {
    localStorage.setItem(RECEIPT_KEY, JSON.stringify(r))
  } catch {}
}
function removeReceipt() {
  try {
    localStorage.removeItem(RECEIPT_KEY)
  } catch {}
}

type Phase = 'form' | 'working' | 'paying' | 'done'
type Outcome = { key: string; result: Availability } | { key: string; failure: ApiFailure }
type HeldBooking = Hold & { detailsKey: string }

const BOOKABLE_ROOMS = ROOMS.filter((r) => ONLINE_ROOM_SLUGS.includes(r.slug))
const PREMIUM_AC = 'premium-ac-room'

/** Choice-architecture label per bookable room. Matches room-tiers.tsx. */
const TIER_BADGE: Record<string, string> = {
  'premium-ac-room': 'Best Experience',
  'premium-room': 'Best Value',
  'double-room': 'Budget Friendly',
}

/**
 * Dates/guests the guest already picked in the homepage booking bar, carried
 * here as query params (`?checkIn=&checkOut=&guests=`). Client-only — this form
 * is ssr:false, so reading the URL on mount is safe.
 */
function initialFromUrl(): { checkIn?: string; checkOut?: string; guests?: string } {
  if (typeof window === 'undefined') return {}
  const p = new URLSearchParams(window.location.search)
  const iso = (v: string | null) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined)
  const g = p.get('guests')
  return { checkIn: iso(p.get('checkIn')), checkOut: iso(p.get('checkOut')), guests: g && /^\d+$/.test(g) ? g : undefined }
}

export function OnlineBookingForm({
  roomSlug,
  source,
  onDisabled,
}: {
  /** Preselects — and on a room page, LOCKS — the room. */
  roomSlug?: string
  source: string
  /** The server said online booking is off. The gate flips to the paused state. */
  onDisabled: () => void
}) {
  const uid = useId()
  const today = useClientToday()

  // On a room page the room is fixed: no selector, no silent re-booking of a
  // different room behind the page's photos. Elsewhere the guest can pick.
  const locked = Boolean(roomSlug && onlineCategory(roomSlug))
  const [slug, setSlug] = useState(locked ? roomSlug! : BOOKABLE_ROOMS[0].slug)
  const room = onlineCategory(slug)!
  const roomInfo = ROOMS_BY_SLUG[slug]
  const roomName = roomInfo?.shortName ?? ''
  const photo = roomInfo?.photos[0]

  // Check-in today, check-out tomorrow (one night) by default — the common case.
  // A same-day check-in is fine: the time field's `min` keeps the arrival time
  // in the future, and the server rejects a past one anyway.
  const [range, setRange] = useState<{ checkIn: string; checkOut: string } | null>(() => {
    const u = initialFromUrl()
    return u.checkIn && u.checkOut ? { checkIn: u.checkIn, checkOut: u.checkOut } : null
  })
  const checkIn = range?.checkIn ?? (today ? today : '')
  const checkOut = range?.checkOut ?? (today ? addDaysISO(today, 1) : '')
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0

  // 24-hour policy: the stay runs a full 24h per night and the guest picks the
  // arrival time (required). The chosen time drives the ERP availability window.
  const [checkInTime, setCheckInTime] = useState('')
  const [guestsChosen, setGuestsChosen] = useState(() => initialFromUrl().guests ?? '2')
  const guests = Math.min(Number(guestsChosen), room.maxGuests)

  const [guestName, setGuestName] = useState('')
  const [guestMobile, setGuestMobile] = useState('')
  const [guestEmail, setGuestEmail] = useState('')

  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [phase, setPhase] = useState<Phase>('form')
  const [payError, setPayError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [reference, setReference] = useState<string | null>(null)
  // Rehydrate a prior receipt (survives refresh). ssr:false on this component,
  // so the initializer only runs in the browser — no hydration mismatch.
  const [persisted, setPersisted] = useState<Receipt | null>(() => readReceipt())
  const [copied, setCopied] = useState(false)
  const held = useRef<HeldBooking | null>(null)

  const guestOptions: SelectOption[] = Array.from({ length: room.maxGuests }, (_, i) => i + 1).map(
    (n) => ({ value: String(n), label: `${n} ${n === 1 ? 'guest' : 'guests'}` }),
  )
  const roomOptions: SelectOption[] = BOOKABLE_ROOMS.map((r) => ({
    value: r.slug,
    label: r.shortName,
    hint: formatINR(r.price),
  }))
  // The arrival time (required). A native time input: typeable, no scrolling,
  // Same-day: the dial can't go earlier than now + payment headroom (rounded
  // up to a clean half hour); the server is the final check. Default to 1 PM
  // (a common arrival), or that earliest time when it's already past 1 PM.
  const sameDay = Boolean(today && checkIn === today)
  const earliest = sameDay ? ceilHalfHour(nowTimeIST(30)) : ''
  const time = checkInTime || (earliest && earliest > '13:00' ? earliest : '13:00')

  // The exact request body for these inputs, or null while they are incomplete.
  // `days` is the night count — the ERP's 24h-day unit (see the file comment).
  const stay = useMemo<Stay | null>(() => {
    if (!checkIn || !today || checkIn < today) return null
    if (nights < 1) return null
    if (!/^\d{2}:\d{2}$/.test(time)) return null
    return { category: room.category, check_in_date: checkIn, check_in_time: time, days: nights, guests }
  }, [checkIn, today, nights, time, room.category, guests])
  const key = stay ? JSON.stringify(stay) : ''

  // An availability answer belongs to the inputs that produced it. Deriving
  // "current" from the key means a stale price can never sit next to changed
  // inputs, not even for the frame before the new request starts.
  const current = outcome && outcome.key === key ? outcome : null
  const checking = stay !== null && current === null

  useEffect(() => {
    if (!stay) return
    const ctrl = new AbortController()
    // Debounced so that dragging through dates is one request, not ten.
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
          description: `${roomName}, ${nights} night${nights === 1 ? '' : 's'} from ${formatShort(checkIn)}`,
          prefill: {
            name: guest.guest_name,
            contact: guest.guest_mobile,
            ...(guest.guest_email ? { email: guest.guest_email } : {}),
          },
          // UX ONLY. This does not confirm anything. See the file comment.
          handler: () => {
            held.current = null
            const ref = bookingId.slice(0, 8).toUpperCase()
            setReference(ref)
            setPhase('done')
            // Keep the receipt so a refresh before WhatsApp confirmation still
            // shows it. This does NOT confirm the booking — the webhook does.
            saveReceipt({ reference: ref, mobile: guest.guest_mobile, ts: Date.now() })
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

  // The confirmation screen shows for a live payment AND on a later visit, when
  // a stored receipt is rehydrated after a refresh.
  const liveRef = phase === 'done' && reference ? reference : null
  const ref = liveRef ?? persisted?.reference ?? null
  const mobile = liveRef ? guestMobile : persisted?.mobile ?? ''
  if (ref) {
    return (
      <div className="rounded-[var(--radius-card)] border border-line bg-paper p-7 lg:p-8" role="status">
        <h3 className="text-[length:var(--text-h3)]">Thank you, we are confirming your booking</h3>
        <p className="mt-3 max-w-[56ch] text-[0.9375rem] leading-relaxed text-ink-soft">
          The payment window reported success. Your booking is confirmed once our system has received
          the payment confirmation from the bank, usually within a minute (up to about ten late at
          night). We will message you on WhatsApp{mobile ? ` at ${mobile}` : ''} with the confirmation
          and check-in details.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-[0.75rem] border border-line bg-paper-2 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[0.625rem] font-medium tracking-[0.14em] text-ink-mute uppercase">
              Your reference
            </p>
            <p className="text-[1.05rem] font-medium text-ink tnum">{ref}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              try {
                navigator.clipboard?.writeText(ref)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              } catch {}
            }}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-[0.8125rem] text-ink-soft transition-colors hover:bg-paper"
          >
            {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <p className="mt-4 max-w-[56ch] text-[0.8125rem] leading-relaxed text-ink-mute">
          Keep this reference — it stays on this page even if you refresh or come back later. If you
          have not heard from us in a few minutes, send it to us on WhatsApp and we will check straight
          away.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <WhatsAppAction
            source={`${source}_paid`}
            enquiry={{ roomSlug: slug, source: `${source}_paid`, note: `Booking reference: ${ref}` }}
            size="lg"
            variant="primary"
            className="w-full sm:w-auto"
          >
            Message reception
          </WhatsAppAction>
          <button
            type="button"
            onClick={() => {
              removeReceipt()
              setPersisted(null)
              setReference(null)
              setPhase('form')
            }}
            className="text-[0.8125rem] text-ink-mute underline underline-offset-4 transition-colors hover:text-ink"
          >
            Book another room
          </button>
        </div>
      </div>
    )
  }

  const busy = phase === 'working' || phase === 'paying'
  const failure = current && 'failure' in current ? current.failure : null
  const upgrade = slug !== PREMIUM_AC ? ROOMS_BY_SLUG[PREMIUM_AC] : null

  return (
    <form
      onSubmit={onSubmit}
      className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper"
      aria-busy={busy}
    >
      {/* Room context — always visible, so the guest sees exactly what they book. */}
      <div className="flex items-center gap-4 border-b border-line bg-paper-2 p-5 sm:p-6">
        {photo && (
          <div className="size-16 shrink-0 overflow-hidden rounded-[0.625rem]">
            <Picture id={photo.id} alt={photo.alt} ratio="1 / 1" sizes="64px" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-brass/15 px-2.5 py-0.5 text-[0.625rem] font-medium tracking-[0.1em] text-brass-3 uppercase dark:text-brass-2">
              {slug === PREMIUM_AC && <Sparkles className="size-2.5" aria-hidden />}
              {TIER_BADGE[slug] ?? 'Online booking'}
            </span>
            {roomInfo?.ac && <span className="text-[0.6875rem] text-ink-mute">❄️ Air conditioned</span>}
          </div>
          <h3 className="mt-1 truncate text-[length:var(--text-h3)]">{roomInfo?.name}</h3>
          <p className="text-[0.8125rem] text-ink-mute">
            {roomInfo && formatINR(roomInfo.price)} / night · sleeps up to {room.maxGuests}
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-7 lg:p-8">
        {/* Change room only where it isn't locked to a room page. */}
        {!locked && (
          <div className={cn(selectBox, 'mb-4')}>
            <SelectField label="Room" icon={Users} value={slug} options={roomOptions} onChange={setSlug} />
          </div>
        )}

        {/* Stay: one calendar for the whole stay, then guests. */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <span className={cn(label, 'mb-2')}>Your stay</span>
            <DateRangeField checkIn={checkIn} checkOut={checkOut} onChange={setRange} />
          </div>
          <div className={cn(selectBox)}>
            <SelectField
              label="Guests"
              icon={Users}
              value={String(guests)}
              options={guestOptions}
              onChange={setGuestsChosen}
            />
          </div>
          <div className={cn(selectBox)}>
            <ClockTimeField value={time} min={earliest || undefined} onChange={setCheckInTime} />
          </div>
        </div>

        <p className="mt-2 text-[0.75rem] leading-relaxed text-ink-mute">
          Each night is a full 24 hours, so you check out at your check-in time on your last day.
          {stay && (
            <>
              {' '}You check out on <span className="text-ink">{formatShort(checkOut)}</span>.
            </>
          )}
        </p>

        {/* Availability and the server's price. This is the only price on the form. */}
        <div className="mt-6 rounded-[0.625rem] border border-line bg-paper-2 px-5 py-4" aria-live="polite">
          {!stay ? (
            <p className="text-[0.9375rem] text-ink-mute">Choose your dates and check-in time to see the live price.</p>
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
                total for {nights} night{nights === 1 ? '' : 's'}, taxes included · available
              </span>
              {available.remaining != null && available.remaining <= 3 && (
                <span className="rounded-full bg-terracotta/10 px-2.5 py-0.5 text-[0.8125rem] font-medium text-terracotta">
                  {available.remaining === 1
                    ? 'Only 1 room left'
                    : `Only ${available.remaining} rooms left`}
                </span>
              )}
            </p>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center rounded-md bg-terracotta px-2.5 py-1 text-[0.8125rem] font-bold tracking-[0.08em] text-white uppercase">
                  Sold out
                </span>
                <p className="mt-2 text-[0.875rem] text-ink-soft">
                  No {roomName} rooms left for these dates. Try different dates or room.
                </p>
              </div>
              <WhatsAppTextLink source={`${source}_unavailable`} enquiry={{ roomSlug: slug, source }}>
                Ask us on WhatsApp
              </WhatsAppTextLink>
            </div>
          )}
        </div>

        {/* Ethical upsell: the real price gap to the best room, never hiding this one. */}
        {upgrade && (
          <Link
            href={`/rooms/${PREMIUM_AC}#book-online`}
            className="mt-4 flex items-center gap-3 rounded-[0.625rem] border border-dashed border-brass/50 bg-brass/5 p-4 text-[0.875rem] leading-relaxed text-ink-soft transition-colors hover:border-brass"
          >
            <Sparkles className="size-4 shrink-0 text-brass" aria-hidden />
            <span>
              Upgrade to <span className="font-medium text-ink">Premium AC</span> for{' '}
              {formatINR(upgrade.price - (roomInfo?.price ?? upgrade.price))}/night more — our quietest,
              air-conditioned room.
            </span>
          </Link>
        )}

        {/* Guest details, order summary and Pay appear only once a room is
            actually available — no point collecting a name for a sold-out date. */}
        {available && (
          <>
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

        {/* Order summary, right above Pay. */}
        {available && (
          <dl className="mt-6 rounded-[0.625rem] border border-line bg-paper-2 p-4 text-[0.875rem]">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-mute">Room</dt>
              <dd className="text-right text-ink">{roomInfo?.name}</dd>
            </div>
            <div className="mt-1.5 flex justify-between gap-4">
              <dt className="text-ink-mute">Dates</dt>
              <dd className="text-right text-ink">
                {formatShort(checkIn)} → {formatShort(checkOut)} · {nights} night{nights === 1 ? '' : 's'}
              </dd>
            </div>
            <div className="mt-1.5 flex justify-between gap-4">
              <dt className="text-ink-mute">Guests</dt>
              <dd className="text-right text-ink">{guests}</dd>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between gap-4 border-t border-line pt-2.5">
              <dt className="font-medium text-ink">Total</dt>
              <dd className="font-display text-[1.25rem] text-ink tnum">{formatINR(available.price)}</dd>
            </div>
          </dl>
        )}

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

        <Button type="submit" variant="brass" size="lg" className="mt-6 w-full" disabled={!available || busy}>
          {busy ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              {phase === 'paying' ? 'Payment window open' : 'Reserving your room'}
            </>
          ) : (
            <>
              {available ? `Pay ${formatINR(available.price)} securely` : 'Pay securely'}
              <ArrowRight aria-hidden />
            </>
          )}
        </Button>

        {/* The one no-refund line. Final pay step only, deliberately understated. */}
        <p className="mt-3 text-center text-[0.75rem] text-ink-mute">Payments are non-refundable.</p>
          </>
        )}

        {/* Trust row: real, verifiable signals only. */}
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-5 text-[0.75rem] text-ink-mute">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-brass" aria-hidden /> Secure payment by Razorpay
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="size-3.5 text-brass" aria-hidden /> Instant WhatsApp confirmation
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Star className="size-3.5 text-brass" aria-hidden /> {HOTEL.rating.value}★ · {HOTEL.rating.count}{' '}
            {HOTEL.rating.source} reviews
          </span>
        </div>

        <p className="mt-4 text-[0.8125rem] leading-relaxed text-ink-mute">
          Prefer to talk first, or need a different room or dates?{' '}
          <WhatsAppTextLink source={`${source}_form`} enquiry={{ roomSlug: slug, source }}>
            Message reception on WhatsApp
          </WhatsAppTextLink>
          .
        </p>
      </div>
    </form>
  )
}
