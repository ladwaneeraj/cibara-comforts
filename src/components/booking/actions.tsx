'use client'

import { MessageCircle, Phone, Navigation } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { track } from '@/lib/analytics'
import { DIRECTIONS_URL, TEL_URL, whatsappUrl, type Enquiry } from '@/lib/booking'
import { cn } from '@/lib/utils'

/**
 * The three conversion actions, in one place.
 *
 * Each is a real anchor with a real href, so it works with JavaScript
 * disabled, survives middle-click and long-press, and is announced correctly
 * by screen readers. Analytics is a side effect of the click, never a
 * precondition for it: if the tracking call throws or the tag never loaded,
 * the guest still reaches WhatsApp.
 */

type ActionProps = Omit<ComponentProps<'a'>, 'href'> &
  Pick<ButtonProps, 'variant' | 'size'> & {
    /** Where on the site this was clicked. Feeds conversion attribution. */
    source: string
    children?: ReactNode
    className?: string
  }

export function WhatsAppAction({
  source,
  enquiry,
  children,
  variant = 'whatsapp',
  size,
  className,
  ...rest
}: ActionProps & { enquiry?: Enquiry }) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a
        href={whatsappUrl({ ...enquiry, source })}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track({ name: 'whatsapp_click', params: { source, room: enquiry?.roomSlug } })}
        {...rest}
      >
        <MessageCircle aria-hidden />
        {children ?? 'Book on WhatsApp'}
        <span className="sr-only"> (opens WhatsApp)</span>
      </a>
    </Button>
  )
}

export function CallAction({
  source,
  children,
  variant = 'outline',
  size,
  className,
  ...rest
}: ActionProps) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a href={TEL_URL} onClick={() => track({ name: 'call_click', params: { source } })} {...rest}>
        <Phone aria-hidden />
        {children ?? 'Call reception'}
      </a>
    </Button>
  )
}

export function DirectionsAction({
  source,
  children,
  variant = 'outline',
  size,
  className,
  ...rest
}: ActionProps) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a
        href={DIRECTIONS_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track({ name: 'directions_click', params: { source } })}
        {...rest}
      >
        <Navigation aria-hidden />
        {children ?? 'Get directions'}
      </a>
    </Button>
  )
}

/** Bare tracked link, for use inside prose. */
export function WhatsAppTextLink({
  source,
  enquiry,
  children,
  className,
}: {
  source: string
  enquiry?: Enquiry
  children: ReactNode
  className?: string
}) {
  return (
    <a
      href={whatsappUrl({ ...enquiry, source })}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track({ name: 'whatsapp_click', params: { source, room: enquiry?.roomSlug } })}
      className={cn(
        'font-medium text-ink underline decoration-brass decoration-2 underline-offset-4',
        'transition-colors hover:decoration-ink',
        className,
      )}
    >
      {children}
    </a>
  )
}
