'use client'

import { Menu, Star } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { WhatsAppAction } from '@/components/booking/actions'
import { Logo } from '@/components/layout/logo'
import { PRIMARY_NAV } from '@/components/layout/nav-config'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { HOTEL } from '@/content/hotel'
import { formatINR } from '@/content/rooms'
import { cn } from '@/lib/utils'

/**
 * The navigation sheet and its Radix Dialog dependency are fetched on the tap
 * that opens the menu, not on page load. `ssr: false` because there is nothing
 * to render until it is open.
 */
const MobileNav = dynamic(() => import('@/components/layout/mobile-nav').then((m) => m.MobileNav), {
  ssr: false,
})

/**
 * Site header.
 *
 * Two states. Over a hero it is transparent with white type, so the
 * photography runs edge to edge and full bleed. Once scrolled it condenses
 * into a translucent bar. The transition is a transform and an opacity change
 * only, so it stays on the compositor.
 *
 * The rating chip sits in the header rather than lower down the page because
 * it is the single strongest trust signal the property has, and a first-time
 * visitor comparing four lodges on a phone decides in the first few seconds.
 */
/** Routes whose first element is a full-bleed dark hero the header sits on. */
const HERO_ROUTES = new Set(['/'])

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  // Gates the dynamic import until after first paint.
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const overHero = HERO_ROUTES.has(pathname)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Deferred one tick past hydration so the menu chunk never competes with
  // anything on the critical path.
  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0)
    return () => window.clearTimeout(id)
  }, [])

  const transparent = overHero && !scrolled

  return (
    <header
      className={cn(
        'no-print fixed inset-x-0 top-0 z-40',
        'transition-[background-color,border-color,box-shadow] duration-500 ease-[var(--ease-swift)]',
        transparent
          ? 'border-b border-transparent bg-transparent text-white'
          : 'border-b border-line bg-paper/85 text-ink shadow-[var(--shadow-subtle)] backdrop-blur-xl',
      )}
    >
      <div className="container-page flex h-[4.5rem] items-center justify-between gap-4 lg:h-20">
        {/* No aria-label: the wordmark's own text is the accessible name, and
            an aria-label that omitted the visible "Harihar, Karnataka" line
            was a WCAG 2.5.3 label-in-name mismatch. */}
        <Link href="/" className="shrink-0 rounded-sm">
          <Logo compact={scrolled} />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {PRIMARY_NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <li key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative inline-flex h-10 items-center rounded-full px-4 text-[0.875rem] transition-colors',
                      'after:absolute after:inset-x-4 after:bottom-1.5 after:h-px after:origin-left',
                      'after:scale-x-0 after:bg-current after:transition-transform after:duration-300',
                      'hover:after:scale-x-100',
                      active && 'after:scale-x-100',
                      transparent ? 'text-white/85 hover:text-white' : 'text-ink-soft hover:text-ink',
                    )}
                  >
                    {item.label}
                  </Link>

                  {'children' in item && (
                    <div
                      className={cn(
                        'invisible absolute top-full left-1/2 w-[22rem] -translate-x-1/2 pt-2 opacity-0',
                        'transition-[opacity,transform] duration-300 ease-[var(--ease-out-soft)]',
                        'translate-y-1 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100',
                        'group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100',
                      )}
                    >
                      <ul className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper p-1.5 shadow-[var(--shadow-lift)]">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="flex items-baseline justify-between gap-3 rounded-[0.625rem] px-3 py-2.5 transition-colors hover:bg-paper-2"
                            >
                              <span className="min-w-0">
                                <span className="block text-[0.875rem] font-medium text-ink">
                                  {child.label}
                                </span>
                                <span className="mt-0.5 block truncate text-[0.75rem] text-ink-mute">
                                  {child.description}
                                </span>
                              </span>
                              <span className="shrink-0 text-[0.8125rem] text-brass-3 tnum dark:text-brass-2">
                                {formatINR(child.price)}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <a
            href={HOTEL.links.maps}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.75rem] transition-colors md:inline-flex',
              transparent
                ? 'border-white/25 text-white/90 hover:border-white/60'
                : 'border-line text-ink-soft hover:border-line-strong',
            )}
          >
            <Star className="size-3 fill-current text-brass" aria-hidden />
            <span className="font-medium tnum">{HOTEL.rating.value}</span>
            <span className="opacity-70">· {HOTEL.rating.count} reviews</span>
          </a>

          <ThemeToggle className={transparent ? 'text-white' : 'text-ink-soft'} />

          <WhatsAppAction
            source="header"
            size="sm"
            variant={transparent ? 'onDark' : 'primary'}
            className="hidden sm:inline-flex"
          >
            Book direct
          </WhatsAppAction>

          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="grid size-11 place-items-center rounded-full transition-colors hover:bg-current/10 lg:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>

          {/* Mounted only after first paint, so the chunk is never fetched on
              the critical path. The sheet closes itself when a link inside it
              is tapped; see mobile-nav.tsx. */}
          {mounted && <MobileNav open={open} onOpenChange={setOpen} />}
        </div>
      </div>
    </header>
  )
}
