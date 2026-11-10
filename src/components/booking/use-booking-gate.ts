'use client'

import { useEffect, useState } from 'react'
import { bookingApi } from '@/lib/booking-api'

/** 'checking' until the ERP answers, then 'open' only on an explicit yes. */
export type BookingGate = 'checking' | 'open' | 'paused'

/**
 * Whether online booking is on, shared by every widget that gates on it (the
 * booking bar, the online form). One `GET /web/config` per page load — the
 * promise is cached module-side so three widgets do not make three calls.
 *
 * Fail closed: anything other than an explicit `online_bookings_enabled: true`
 * is 'paused' — the flag being false, the request failing, a timeout, or
 * NEXT_PUBLIC_API_BASE unset at build time. A widget that guessed "open" when it
 * cannot reach the ERP would hide the WhatsApp fallback while nothing can take
 * the booking. See online-booking.tsx.
 */
let shared: Promise<'open' | 'paused'> | undefined

export function loadBookingGate(): Promise<'open' | 'paused'> {
  shared ??= bookingApi
    .config()
    .then((res): 'open' | 'paused' =>
      res.ok && res.data.online_bookings_enabled === true ? 'open' : 'paused',
    )
    .catch((): 'paused' => 'paused')
  return shared
}

export function useBookingGate(): BookingGate {
  const [gate, setGate] = useState<BookingGate>('checking')
  useEffect(() => {
    let alive = true
    loadBookingGate().then((g) => {
      if (alive) setGate(g)
    })
    return () => {
      alive = false
    }
  }, [])
  return gate
}
