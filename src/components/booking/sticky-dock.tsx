'use client'

import { MessageCircle, Navigation, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { track } from '@/lib/analytics'
import { DIRECTIONS_URL, TEL_URL, whatsappUrl } from '@/lib/booking'
import { cn } from '@/lib/utils'

/**
 * Persistent contact dock.
 *
 * Mobile: a bottom bar in the thumb zone, which is where a one-handed guest
 * can actually reach. It appears after the hero has been scrolled past, so it
 * never covers the hero call to action, and it reserves its own height via
 * body padding so it cannot obscure the footer.
 *
 * Desktop: a vertical rail on the right, out of the reading column.
 *
 * Three actions and no more. A dock with five buttons is a menu, and menus do
 * not convert.
 */
export function StickyDock({ roomSlug }: { roomSlug?: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const items = [
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      sub: 'Replies in minutes',
      href: whatsappUrl({ roomSlug, source: 'sticky_dock' }),
      icon: MessageCircle,
      external: true,
      onClick: () => track({ name: 'whatsapp_click', params: { source: 'sticky_dock', room: roomSlug } }),
      primary: true,
    },
    {
      key: 'call',
      label: 'Call',
      sub: 'Reception, 24 hours',
      href: TEL_URL,
      icon: Phone,
      external: false,
      onClick: () => track({ name: 'call_click', params: { source: 'sticky_dock' } }),
      primary: false,
    },
    {
      key: 'directions',
      label: 'Directions',
      sub: '800m from the station',
      href: DIRECTIONS_URL,
      icon: Navigation,
      external: true,
      onClick: () => track({ name: 'directions_click', params: { source: 'sticky_dock' } }),
      primary: false,
    },
  ]

  return (
    <>
      {/* Mobile: thumb-zone bar */}
      <nav
        aria-label="Contact the hotel"
        className={cn(
          'no-print fixed inset-x-0 bottom-0 z-50 lg:hidden',
          'border-t border-line bg-paper/92 backdrop-blur-xl',
          'pb-[env(safe-area-inset-bottom)]',
          'transition-transform duration-500 ease-[var(--ease-swift)]',
          visible ? 'translate-y-0' : 'translate-y-full',
        )}
      >
        <ul className="grid grid-cols-3">
          {items.map((item) => (
            <li key={item.key} className="contents">
              <a
                href={item.href}
                onClick={item.onClick}
                {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className={cn(
                  'flex min-h-[3.75rem] flex-col items-center justify-center gap-1 px-2 py-2',
                  'text-[0.6875rem] font-medium transition-colors',
                  item.primary ? 'text-[#0F7D42] dark:text-[#5FD98C]' : 'text-ink-soft',
                  'active:bg-ink/5',
                )}
              >
                <item.icon className="size-[1.15rem]" aria-hidden />
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Desktop: right-hand rail */}
      <div
        className={cn(
          'no-print fixed right-5 bottom-6 z-50 hidden flex-col items-end gap-2 lg:flex',
          'transition-all duration-500 ease-[var(--ease-swift)]',
          visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
        )}
      >
        {items.map((item) => (
          <a
            key={item.key}
            href={item.href}
            onClick={item.onClick}
            {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className={cn(
              'group flex items-center gap-3 rounded-full border py-2.5 pr-5 pl-3',
              'shadow-[var(--shadow-card)] transition-all duration-300 ease-[var(--ease-swift)]',
              'hover:shadow-[var(--shadow-lift)] hover:-translate-y-0.5',
              item.primary
                ? 'border-transparent bg-[#0F7D42] text-white hover:bg-[#0C6B38]'
                : 'border-line bg-paper/95 text-ink backdrop-blur-md hover:border-line-strong',
            )}
          >
            <span
              className={cn(
                'grid size-8 place-items-center rounded-full',
                item.primary ? 'bg-white/15' : 'bg-ink/5',
              )}
            >
              <item.icon className="size-4" aria-hidden />
            </span>
            <span className="text-left leading-tight">
              <span className="block text-[0.8125rem] font-medium">{item.label}</span>
              <span
                className={cn(
                  'block text-[0.6875rem]',
                  item.primary ? 'text-white/75' : 'text-ink-mute',
                )}
              >
                {item.sub}
              </span>
            </span>
          </a>
        ))}
      </div>

      {/* Reserves space so the mobile dock never covers the last line of the footer. */}
      <div aria-hidden className="h-[3.75rem] lg:hidden" />
    </>
  )
}
