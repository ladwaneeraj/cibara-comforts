'use client'

import { ArrowRight, ShieldCheck } from 'lucide-react'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ROOMS, formatINR } from '@/content/rooms'
import { track } from '@/lib/analytics'
import { whatsappUrl } from '@/lib/booking'
import { addDays, cn, isoDate, nights } from '@/lib/utils'

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

  const today = isoDate(new Date())

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

    const checkIn = String(data.get('checkIn') || '')
    const checkOut = String(data.get('checkOut') || '')
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
        room: String(data.get('room') || '') || undefined,
        nights: checkIn && checkOut ? nights(checkIn, checkOut) : undefined,
      },
    })

    window.open(
      whatsappUrl({
        checkIn: checkIn || undefined,
        checkOut: checkOut || undefined,
        guests: Number(data.get('guests')) || undefined,
        roomSlug: String(data.get('room') || '') || undefined,
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${uid}-in`} className={label}>
              Check in
            </label>
            <input
              id={`${uid}-in`}
              name="checkIn"
              type="date"
              min={today}
              defaultValue={today}
              className={cn(field, 'mt-2')}
            />
          </div>
          <div>
            <label htmlFor={`${uid}-out`} className={label}>
              Check out
            </label>
            <input
              id={`${uid}-out`}
              name="checkOut"
              type="date"
              min={today}
              defaultValue={isoDate(addDays(new Date(), 1))}
              className={cn(field, 'mt-2')}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${uid}-guests`} className={label}>
              Guests
            </label>
            <select id={`${uid}-guests`} name="guests" defaultValue="2" className={cn(field, 'mt-2')}>
              {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'guest' : 'guests'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${uid}-room`} className={label}>
              Room
            </label>
            <select id={`${uid}-room`} name="room" defaultValue="" className={cn(field, 'mt-2')}>
              <option value="">Not sure yet</option>
              {ROOMS.map((room) => (
                <option key={room.slug} value={room.slug}>
                  {room.name} · {formatINR(room.price)}
                </option>
              ))}
            </select>
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
