'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { ChevronRight, X } from 'lucide-react'
import Link from 'next/link'
import { WhatsAppAction } from '@/components/booking/actions'
import { Logo } from '@/components/layout/logo'
import { PRIMARY_NAV } from '@/components/layout/nav-config'
import { HOTEL } from '@/content/hotel'
import { formatINR } from '@/content/rooms'
import { cn } from '@/lib/utils'

/**
 * Mobile navigation sheet.
 *
 * Split into its own module and loaded with next/dynamic from the header, so
 * Radix Dialog's roughly 25 KB is fetched on the tap that opens the menu
 * rather than on every page load. On a phone that is 25 KB of parse and
 * execute removed from the critical path, for a component most visitors never
 * open. The header keeps a plain <button> as the trigger, so the tap target
 * exists and is labelled before the chunk arrives.
 */
export function MobileNav({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-forest-2/50 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-paper',
            'shadow-[var(--shadow-lift)] outline-none',
            'data-[state=open]:animate-[sheet-in_380ms_var(--ease-out-soft)]',
          )}
        >
          <Dialog.Title className="sr-only">Menu</Dialog.Title>
          <Dialog.Description className="sr-only">
            Site navigation and booking contacts
          </Dialog.Description>

          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <Logo />
            <Dialog.Close
              aria-label="Close menu"
              className="grid size-11 place-items-center rounded-full text-ink-soft transition-colors hover:bg-ink/5"
            >
              <X className="size-5" aria-hidden />
            </Dialog.Close>
          </div>

          <nav aria-label="Mobile" className="flex-1 overflow-y-auto overscroll-contain px-2 py-3">
            <ul>
              {PRIMARY_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between rounded-[0.75rem] px-3 py-3.5 font-display text-[1.375rem] text-ink transition-colors hover:bg-paper-2"
                  >
                    {item.label}
                    <ChevronRight className="size-4 text-ink-mute" aria-hidden />
                  </Link>
                  {'children' in item && (
                    <ul className="mb-2 ml-3 border-l border-line pl-4">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="flex items-baseline justify-between gap-3 py-2.5 text-[0.9375rem] text-ink-soft transition-colors hover:text-ink"
                          >
                            {child.label}
                            <span className="text-[0.8125rem] text-ink-mute tnum">
                              {formatINR(child.price)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <WhatsAppAction source="mobile_menu" size="lg" className="w-full" />
            <p className="mt-3 text-center text-caption text-ink-mute">
              Reception is open 24 hours ·{' '}
              <a href={`tel:${HOTEL.contact.phoneE164}`} className="underline underline-offset-4">
                {HOTEL.contact.phoneDisplay}
              </a>
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
