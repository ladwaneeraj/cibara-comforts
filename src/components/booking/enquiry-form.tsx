'use client'

import { ArrowRight, BedDouble, ShieldCheck, Users } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useId, useState } from 'react'
import { DateTrigger } from '@/components/booking/date-trigger'
import { SelectTrigger, type SelectOption } from '@/components/booking/select-field'
import { Button } from '@/components/ui/button'
import { ROOMS, formatINR } from '@/content/rooms'
import { track } from '@/lib/analytics'
import { whatsappUrl } from '@/lib/booking'
import { addDaysISO, nightsBetween, useClientToday } from '@/lib/dates'
import { cn } from '@/lib/utils'

const DateRangeField = dynamic(
  () => import('@/components/booking/date-range-field').then((m) => m.DateRangeField),
  { ssr: false, loading: () => null },
)

const SelectField = dynamic(
  () => import('@/components/booking/select-field').then((m) => m.SelectField),
  { ssr: false, loading: () => null },
)

/**
 * Enquiry form.
 *
 * Composes a WhatsApp message and hands off, rather than posting anywhere.
 *
 * That is a deliberate choice, not a limitation of static hosting. A form that
 * posts to an inbox gives the guest no confirmation, no thread, and no way to
 * follow up, and it gives the property a channel it checks once a day. This
 * form ends in a conversation on the channel reception already lives in, with
 * a written record on both sides. It also means no form backend to secure, no
 * spam endpoint, and no personal data at rest anywhere.
 *
 * Anti-spam: a honeypot field plus a minimum time-to-submit. Both are enough
 * for a target this size and neither costs the guest a CAPTCHA.
 *
 * Validation is native HTML constraint validation, which is keyboard
 * accessible, screen-reader announced and localised for free.
 */
export function EnquiryForm({ className }: { className?: string }) {
  const uid = useId()
  const [mountedAt] = useState(() => Date.now())
  const [error, setError] = useState<string | null>(null)

  const today = useClientToday()
  const [chosen, setChosen] = useState<{ checkIn: string; checkOut: string } | null>(null)
  const range = chosen ??
    (today ? { checkIn: today, checkOut: addDaysISO(today, 1) } : { checkIn: '', checkOut: '' })
  const setRange = setChosen
  // Same intent-based mount as the booking bar. See booking-bar.tsx.
  const [calendar, setCalendar] = useState<'idle' | 'ready' | 'opening'>('idle')
  const [selects, setSelects] = useState<'idle' | 'guests' | 'room'>('idle')
  const [guests, setGuests] = useState('2')
  const [room, setRoom] = useState('')

  const guestOptions: SelectOption[] = [1, 2, 3, 4, 5, 6, 8, 10].map((n) => ({
    value: String(n),
    label: `${n} ${n === 1 ? 'guest' : 'guests'}`,
  }))
  const roomOptions: SelectOption[] = [
    { value: '', label: 'Not sure yet' },
    ...ROOMS.map((r) => ({ value: r.slug, label: r.name, hint: formatINR(r.price) })),
  ]

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)

    // Honeypot: a field hidden from humans. Anything in it is a bot.
    if (data.get('company')) return

    // Bots submit instantly. Humans do not.
    if (Date.now() - mountedAt < 2500) {
      setError('That was quick. Give it a moment and try again.')
      return
    }

    setError(null)

    const note = [
      `Name: ${data.get('name')}`,
      data.get('phone') ? `Phone: ${data.get('phone')}` : null,
      data.get('message') ? `\n${data.get('message')}` : null,
    ]
      .filter(Boolean)
      .join('\n')

    track({
      name: 'enquiry_submit',
      params: {
        source: 'enquiry_form',
        room: room || undefined,
        nights: nightsBetween(range.checkIn, range.checkOut),
      },
    })

    window.open(
      whatsappUrl({
        checkIn: range.checkIn,
        checkOut: range.checkOut,
        guests: Number(guests) || undefined,
        roomSlug: room || undefined,
        source: 'enquiry_form',
        note,
      }),
      '_blank',
      'noopener,noreferrer',
    )
  }

  const field =
    'h-12 w-full rounded-[0.625rem] border border-line bg-paper px-4 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-mute focus:border-line-strong [color-scheme:light] dark:[color-scheme:dark]'
  const label = 'block text-[0.6875rem] font-medium tracking-[0.14em] text-ink-mute uppercase'

  return (
    <form
      onSubmit={onSubmit}
      className={cn('rounded-[var(--radius-card)] border border-line bg-paper-2 p-7 lg:p-8', className)}
    >
      <h2 className="text-[length:var(--text-h3)]">Send an enquiry</h2>
      <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-mute">
        Fill this in and it opens WhatsApp with the details already written out. You send it,
        reception replies, and you both have a record. Nothing is charged and nothing is booked
        until you agree it.
      </p>

      <div className="mt-7 space-y-5">
        <div>
          <label htmlFor={`${uid}-name`} className={label}>
            Your name
          </label>
          <input
            id={`${uid}-name`}
            name="name"
            required
            autoComplete="name"
            placeholder="So we know who to expect"
            className={cn(field, 'mt-2')}
          />
        </div>

        <div>
          <label htmlFor={`${uid}-phone`} className={label}>
            Phone number <span className="normal-case opacity-70">(optional)</span>
          </label>
          <input
            id={`${uid}-phone`}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="If WhatsApp is not the best way to reach you"
            className={cn(field, 'mt-2')}
          />
        </div>

        <div>
          <span className={label}>Your stay</span>
          <div className="mt-2 overflow-hidden rounded-[0.625rem] border border-line">
            {calendar === 'idle' || !today ? (
              <DateTrigger
                checkIn={range.checkIn}
                checkOut={range.checkOut}
                onPointerEnter={() => setCalendar('ready')}
                onTouchStart={() => setCalendar('ready')}
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
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="overflow-hidden rounded-[0.625rem] border border-line">
            {selects === 'guests' ? (
              <SelectField
                label="Guests"
                icon={Users}
                value={guests}
                options={guestOptions}
                onChange={setGuests}
                autoOpen
              />
            ) : (
              <SelectTrigger
                label="Guests"
                icon={Users}
                display={guestOptions.find((o) => o.value === guests)?.label ?? ''}
                onPointerEnter={() => setSelects((v) => (v === 'idle' ? 'guests' : v))}
                onClick={() => setSelects('guests')}
              />
            )}
          </div>
          <div className="overflow-hidden rounded-[0.625rem] border border-line">
            {selects === 'room' ? (
              <SelectField
                label="Room"
                icon={BedDouble}
                value={room}
                options={roomOptions}
                onChange={setRoom}
                autoOpen
              />
            ) : (
              <SelectTrigger
                label="Room"
                icon={BedDouble}
                display={roomOptions.find((o) => o.value === room)?.label ?? 'Not sure yet'}
                hint={roomOptions.find((o) => o.value === room)?.hint}
                onPointerEnter={() => setSelects((v) => (v === 'idle' ? 'room' : v))}
                onClick={() => setSelects('room')}
              />
            )}
          </div>
        </div>

        <div>
          <label htmlFor={`${uid}-message`} className={label}>
            Anything we should know <span className="normal-case opacity-70">(optional)</span>
          </label>
          <textarea
            id={`${uid}-message`}
            name="message"
            rows={3}
            placeholder="Arriving late, travelling with a dog, need a GST invoice, four rooms for a wedding"
            className={cn(field, 'mt-2 h-auto resize-y py-3 leading-relaxed')}
          />
        </div>

        {/* Honeypot. Hidden from people, irresistible to bots. */}
        <div aria-hidden className="absolute h-0 w-0 overflow-hidden opacity-0">
          <label htmlFor={`${uid}-company`}>Company</label>
          <input id={`${uid}-company`} name="company" tabIndex={-1} autoComplete="off" />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-5 text-[0.875rem] text-terracotta">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="mt-7 w-full">
        Open WhatsApp with these details
        <ArrowRight aria-hidden />
      </Button>

      <p className="mt-4 flex items-start gap-2 text-[0.75rem] leading-relaxed text-ink-mute">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-brass" aria-hidden />
        Nothing is stored on this website. The details go straight into a WhatsApp message that you
        send yourself, so no server here ever holds your name or number.
      </p>
    </form>
  )
}
