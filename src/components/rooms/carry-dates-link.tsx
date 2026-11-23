'use client'

import Link from 'next/link'
import { useEffect, useState, type ReactNode } from 'react'

/**
 * A room link that carries the booking dates forward.
 *
 * The site is a static export, so the check-in/out the guest picked on the
 * homepage arrive here only as the live URL query. This reads them on mount and
 * appends them to the room link, so the room page's booking form opens already
 * filled in — no re-entering dates on the way from "See rooms" to Pay. It
 * renders the plain href first (correct for crawlers and before JS), then adds
 * the query once mounted.
 */
const CARRY = ['checkIn', 'checkOut', 'guests']

export function CarryDatesLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: ReactNode
}) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    try {
      const incoming = new URLSearchParams(window.location.search)
      const out = new URLSearchParams()
      for (const key of CARRY) {
        const value = incoming.get(key)
        if (value) out.set(key, value)
      }
      setQuery(out.toString())
    } catch {}
  }, [])

  return (
    <Link href={query ? `${href}?${query}` : href} className={className}>
      {children}
    </Link>
  )
}
