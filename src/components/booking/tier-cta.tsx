'use client'

import { ArrowRight } from 'lucide-react'
import { WhatsAppAction } from '@/components/booking/actions'
import { useBookingGate } from '@/components/booking/use-booking-gate'
import { Button } from '@/components/ui/button'
import { track } from '@/lib/analytics'

/**
 * The per-tier call to action, behind the same gate as the booking bar. When
 * the ERP has online booking on, it's "Book online" straight to that room's
 * #book-online form; otherwise it's the WhatsApp enquiry, so the section still
 * converts while payments are paused. 'checking' shows WhatsApp too — never a
 * dead button.
 */
export function TierCta({
  slug,
  source,
  featured = false,
}: {
  slug: string
  source: string
  featured?: boolean
}) {
  const gate = useBookingGate()

  if (gate === 'open') {
    return (
      <Button
        asChild
        size="lg"
        variant={featured ? 'primary' : 'outline'}
        className="mt-6 w-full"
      >
        <a
          href={`/rooms/${slug}#book-online`}
          onClick={() => track({ name: 'book_online_click', params: { source, room: slug } })}
        >
          Book online
          <ArrowRight aria-hidden />
        </a>
      </Button>
    )
  }

  return (
    <WhatsAppAction
      source={source}
      enquiry={{ roomSlug: slug, source }}
      size="lg"
      variant={featured ? 'primary' : 'outline'}
      className="mt-6 w-full"
    >
      Check availability
    </WhatsAppAction>
  )
}
