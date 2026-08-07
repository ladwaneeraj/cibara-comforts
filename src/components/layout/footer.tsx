import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/layout/logo'
import { FOOTER_NAV } from '@/components/layout/nav-config'
import { InstagramIcon } from '@/components/ui/brand-icons'
import { FULL_ADDRESS, HOTEL } from '@/content/hotel'

/**
 * Footer.
 *
 * Also the site's name-address-phone block. Marked up with microformats
 * (h-card) alongside the JSON-LD, because local-search crawlers and some
 * citation aggregators still read microformats, and consistent NAP across
 * every citation is the largest single lever in local SEO.
 *
 * The link columns are the internal-linking layer: every SEO cluster page and
 * every room is reachable from the footer of every page, which is how those
 * long-tail pages accumulate internal link equity without a link farm.
 */
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-line bg-paper-2">
      <div className="container-page py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)]">
          {/* Identity and NAP */}
          <div className="h-card">
            <Link href="/" className="inline-block">
              <Logo />
            </Link>

            <p className="mt-6 max-w-sm text-[0.9375rem] leading-relaxed text-ink-soft">
              An owner-run lodge in Harihar since {HOTEL.foundedYear}. Clean rooms, honest rates and
              somebody at the desk whatever time you arrive.
            </p>

            <address className="mt-7 space-y-3 text-[0.9375rem] not-italic">
              <a
                href={HOTEL.links.maps}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-3 text-ink-soft transition-colors hover:text-ink"
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-brass" aria-hidden />
                <span className="p-adr">{FULL_ADDRESS}</span>
              </a>
              <a
                href={`tel:${HOTEL.contact.phoneE164}`}
                className="flex gap-3 text-ink-soft transition-colors hover:text-ink"
              >
                <Phone className="mt-0.5 size-4 shrink-0 text-brass" aria-hidden />
                <span className="p-tel tnum">{HOTEL.contact.phoneDisplay}</span>
              </a>
              <a
                href={`mailto:${HOTEL.contact.email}`}
                className="flex gap-3 text-ink-soft transition-colors hover:text-ink"
              >
                <Mail className="mt-0.5 size-4 shrink-0 text-brass" aria-hidden />
                <span className="u-email">{HOTEL.contact.email}</span>
              </a>
              <p className="flex gap-3 text-ink-soft">
                <Clock className="mt-0.5 size-4 shrink-0 text-brass" aria-hidden />
                <span>
                  Reception open 24 hours. Check in from {HOTEL.checkIn}, check out by {HOTEL.checkOut}.
                </span>
              </p>
            </address>

            <a
              href={HOTEL.links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[0.8125rem] text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
            >
              <InstagramIcon className="size-4" />
              @cibara_comforts
            </a>
          </div>

          {/* Link graph */}
          <nav aria-label="Footer" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FOOTER_NAV.map((group) => (
              <div key={group.heading}>
                <h2 className="eyebrow">{group.heading}</h2>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[0.875rem] text-ink-soft transition-colors hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-14 border-t border-line pt-7">
          <div className="flex flex-col gap-4 text-[0.8125rem] text-ink-mute sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {HOTEL.name}. Harihar, Karnataka.
            </p>
            <p className="max-w-xl sm:text-right">
              Also listed on {HOTEL.otas.join(', ')}. Booking direct is normally cheaper, because
              there is no commission to pay.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
