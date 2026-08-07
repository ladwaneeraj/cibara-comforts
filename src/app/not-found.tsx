import type { Metadata } from 'next'
import Link from 'next/link'
import { WhatsAppAction } from '@/components/booking/actions'
import { PRIMARY_NAV } from '@/components/layout/nav-config'
import { Picture } from '@/components/media/picture'
import { formatINR, ROOMS } from '@/content/rooms'

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'That page has moved or never existed. Rooms, rates and directions for Cibara Comforts in Harihar are all one click away.',
  robots: { index: false, follow: true },
}

/**
 * 404.
 *
 * The old site had URLs like /#rooms in its sitemap and was indexed with them,
 * so some inbound links will land here after the rebuild. Rather than a dead
 * end, this offers the five things somebody was most likely looking for, plus
 * the WhatsApp button, so a broken link still has a chance of converting.
 */
export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-[80svh] items-center overflow-hidden bg-forest-2 pt-32 pb-20">
      <div className="absolute inset-0 -z-10">
        <Picture id="hero4" alt="" sizes="100vw" className="h-full w-full opacity-25" />
        <div aria-hidden className="absolute inset-0 bg-forest-2/80" />
      </div>

      <div className="container-page">
        <p className="eyebrow text-brass-2">
          <span aria-hidden className="h-px w-6 bg-current opacity-60" />
          404
        </p>
        <h1 className="mt-6 max-w-2xl text-[length:var(--text-h1)] text-white">
          That page has moved, or never existed.
        </h1>
        <p className="mt-5 max-w-lg text-[length:var(--text-lead)] leading-relaxed text-white/80">
          The site was rebuilt, so a few old links no longer land where they used to. Here is
          everything worth reading.
        </p>

        <div className="mt-10 grid gap-10 sm:grid-cols-2">
          <nav aria-label="Main pages">
            <h2 className="text-[0.6875rem] tracking-[0.14em] text-white/50 uppercase">Pages</h2>
            <ul className="mt-4 space-y-2.5">
              {[{ label: 'Home', href: '/' }, ...PRIMARY_NAV].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[1.0625rem] font-display text-white/85 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Rooms">
            <h2 className="text-[0.6875rem] tracking-[0.14em] text-white/50 uppercase">Rooms</h2>
            <ul className="mt-4 space-y-2.5">
              {ROOMS.map((room) => (
                <li key={room.slug}>
                  <Link
                    href={`/rooms/${room.slug}`}
                    className="inline-flex items-baseline gap-3 text-[1.0625rem] font-display text-white/85 transition-colors hover:text-white"
                  >
                    {room.shortName}
                    <span className="text-[0.8125rem] text-brass-2 tnum">
                      {formatINR(room.price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12">
          <WhatsAppAction source="404" size="lg" />
        </div>
      </div>
    </div>
  )
}
