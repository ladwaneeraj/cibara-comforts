import { HOTEL } from '@/content/hotel'
import { formatINR, ROOMS_BY_SLUG } from '@/content/rooms'
import { nights, shortDate } from './utils'

/**
 * Booking is enquiry-first by design.
 *
 * The property has no channel manager and no live inventory feed, so a
 * calendar widget showing green "available" cells would be a fiction. Faking
 * availability is the fastest way to lose a guest who arrives to find the room
 * gone. Instead the widget collects the three facts a human needs to confirm a
 * room, formats them into a WhatsApp message, and hands off. Reception replies
 * in minutes, which is faster than most OTA confirmations anyway.
 *
 * When a real availability API appears, `buildEnquiry` is the only thing that
 * needs to change: swap the deep link for a fetch and keep the same shape.
 */
export type Enquiry = {
  checkIn?: string
  checkOut?: string
  guests?: number
  roomSlug?: string
  /** Where on the site the enquiry started. Used for conversion attribution. */
  source?: string
  /** Free text appended by the guest. */
  note?: string
}

function line(label: string, value: string | undefined): string | null {
  return value ? `${label}: ${value}` : null
}

/** Human-readable WhatsApp message body. Kept short; long messages get skimmed. */
export function enquiryMessage(e: Enquiry = {}): string {
  const room = e.roomSlug ? ROOMS_BY_SLUG[e.roomSlug] : undefined
  const n = e.checkIn && e.checkOut ? nights(e.checkIn, e.checkOut) : 0

  const parts = [
    `Hello ${HOTEL.name}, I would like to book a room.`,
    '',
    line('Room', room ? `${room.name} (${formatINR(room.price)} / ${room.priceUnit})` : undefined),
    line('Check in', e.checkIn ? shortDate(e.checkIn) : undefined),
    line('Check out', e.checkOut ? shortDate(e.checkOut) : undefined),
    line('Nights', n > 0 ? String(n) : undefined),
    line('Guests', e.guests ? String(e.guests) : undefined),
    e.note ? `\n${e.note}` : null,
    '',
    'Could you confirm availability and the total? Thank you.',
  ].filter((p): p is string => p !== null)

  return parts.join('\n')
}

/** wa.me deep link. Opens the app on mobile and WhatsApp Web on desktop. */
export function whatsappUrl(e: Enquiry = {}): string {
  return `https://wa.me/${HOTEL.contact.whatsapp}?text=${encodeURIComponent(enquiryMessage(e))}`
}

export const TEL_URL = `tel:${HOTEL.contact.phoneE164}`
export const RECEPTION_TEL_URL = `tel:${HOTEL.contact.receptionE164}`
export const EMAIL_URL = `mailto:${HOTEL.contact.email}`

/** Google Maps turn-by-turn to the property. */
export const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${HOTEL.geo.lat}%2C${HOTEL.geo.lng}`

/**
 * Estimated total for the enquiry widget.
 *
 * Deliberately labelled as an estimate in the UI. It exists so a guest is not
 * surprised at the desk, not to take payment.
 */
export function estimateTotal(e: Enquiry): { nights: number; total: number; breakdown: string } | null {
  const room = e.roomSlug ? ROOMS_BY_SLUG[e.roomSlug] : undefined
  if (!room || !e.checkIn || !e.checkOut) return null

  const n = nights(e.checkIn, e.checkOut)
  if (n <= 0) return null

  const guests = e.guests ?? room.occupancy.standard
  const extraGuests = Math.max(0, guests - room.occupancy.standard)
  const extraPerNight = extraGuests * (room.extraPersonPrice ?? 0)

  let total = (room.price + extraPerNight) * n
  const longStay = n >= 7
  if (longStay) total = Math.round(total * 0.85)

  const bits = [`${formatINR(room.price)} x ${n} night${n > 1 ? 's' : ''}`]
  if (extraGuests > 0) bits.push(`${extraGuests} extra guest at ${formatINR(room.extraPersonPrice ?? 0)}`)
  if (longStay) bits.push('15% long-stay discount applied')

  return { nights: n, total, breakdown: bits.join(' · ') }
}
