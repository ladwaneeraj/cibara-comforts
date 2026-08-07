import { Check, Minus } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/layout/page-header'
import { Reveal } from '@/components/motion/reveal'
import { Picture } from '@/components/media/picture'
import { ClosingCta } from '@/components/sections/closing-cta'
import { NoPhotoPanel } from '@/components/sections/rooms-showcase'
import { Section } from '@/components/ui/section'
import { HOTEL } from '@/content/hotel'
import { formatINR, LOWEST_RATE, ROOMS } from '@/content/rooms'
import { breadcrumbNode, jsonLdGraph, roomNode } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'
import { cn } from '@/lib/utils'

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Rooms', path: '/rooms' },
]

export const metadata: Metadata = pageMetadata({
  title: 'Rooms and Rates',
  description: `All five rooms at ${HOTEL.name}, Harihar: dorm ₹250, single ₹450, double ₹900, premium ₹1,200, premium AC ₹1,800. Direct rates, taxes in, free cancellation.`,
  path: '/rooms',
  image: '/og/rooms.jpg',
})

export default function RoomsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdGraph(breadcrumbNode(CRUMBS), ...ROOMS.map(roomNode)),
        }}
      />

      <PageHeader
        crumbs={CRUMBS}
        eyebrow="Five rooms"
        titleLines={['Every room, every rate,', 'on one page']}
        lead={
          <>
            No hidden categories and no dynamic pricing. What you see below is what you pay at the
            desk, taxes included, for two guests. Rooms start at {formatINR(LOWEST_RATE)}.
          </>
        }
      />

      <Section tone="paper">
        <div className="container-page space-y-20 lg:space-y-28">
          {ROOMS.map((room, i) => {
            const photo = room.photos[0]
            const reversed = i % 2 === 1
            return (
              <Reveal key={room.slug}>
                <article
                  className={cn(
                    'grid items-center gap-8 lg:grid-cols-2 lg:gap-16',
                    reversed && 'lg:[&>figure]:order-2',
                  )}
                >
                  <figure>
                    <Link
                      href={`/rooms/${room.slug}`}
                      className="group block overflow-hidden rounded-[var(--radius-card)]"
                    >
                      {photo ? (
                        <Picture
                          id={photo.id}
                          alt={photo.alt}
                          sizes="(min-width: 1024px) 48vw, 100vw"
                          ratio="4 / 3"
                          className="transition-transform duration-[1100ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
                        />
                      ) : (
                        <NoPhotoPanel label={room.shortName} />
                      )}
                      <span className="sr-only">See the {room.name}</span>
                    </Link>
                  </figure>

                  <div>
                    <div className="flex items-baseline justify-between gap-6 border-b border-line pb-5">
                      <h2 className="text-[length:var(--text-h2)]">{room.name}</h2>
                      <p className="shrink-0 text-right">
                        <span className="block font-display text-[1.75rem] leading-none text-ink tnum">
                          {formatINR(room.price)}
                        </span>
                        <span className="mt-1 block text-[0.75rem] text-ink-mute">
                          per {room.priceUnit}
                        </span>
                      </p>
                    </div>

                    <div className="mt-6 space-y-4 text-[length:var(--text-body-lg)] leading-relaxed text-ink-soft">
                      {room.description.map((para) => (
                        <p key={para.slice(0, 30)}>{para}</p>
                      ))}
                    </div>

                    <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-3 border-y border-line py-5 text-[0.875rem]">
                      <Spec label="Sleeps" value={`${room.occupancy.standard}, up to ${room.occupancy.max}`} />
                      <Spec label="Bed" value={room.bed} />
                      <Spec label="Bathroom" value={room.bathroom} />
                      <Spec label="Cooling" value={room.ac ? 'Split air conditioning' : 'Ceiling fan'} />
                    </dl>

                    <div className="mt-7 flex flex-wrap items-center gap-4">
                      <Link
                        href={`/rooms/${room.slug}`}
                        className="inline-flex h-12 items-center rounded-full bg-ink px-6 text-[0.9375rem] font-medium text-paper transition-colors hover:bg-forest"
                      >
                        See the {room.shortName}
                      </Link>
                      <p className="text-[0.8125rem] text-ink-mute">
                        Best for {room.bestFor.join(', ').toLowerCase()}
                      </p>
                    </div>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </Section>

      <ComparisonTable />
      <ClosingCta />
    </>
  )
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.6875rem] tracking-[0.14em] text-ink-mute uppercase">{label}</dt>
      <dd className="mt-1 text-ink">{value}</dd>
    </div>
  )
}

/**
 * Comparison table.
 *
 * Present because the decision a visitor is actually making is "which of these
 * five", and forcing that comparison across five separate scrolls is how a
 * booking gets deferred to a competitor's page that laid it out plainly.
 *
 * Real <table> markup with scope attributes rather than a grid of divs, so it
 * is navigable by screen reader in table mode and readable by a crawler as
 * structured pricing.
 */
function ComparisonTable() {
  const rows = [
    { label: 'Price for two', get: (r: (typeof ROOMS)[number]) => formatINR(r.price) },
    { label: 'Extra guest', get: (r: (typeof ROOMS)[number]) => (r.extraPersonPrice ? formatINR(r.extraPersonPrice) : null) },
    { label: 'Maximum guests', get: (r: (typeof ROOMS)[number]) => String(r.occupancy.max) },
    { label: 'Private bathroom', get: (r: (typeof ROOMS)[number]) => (r.bathroom === 'En-suite' ? true : null) },
    { label: 'Air conditioning', get: (r: (typeof ROOMS)[number]) => (r.ac ? true : null) },
    { label: 'Television', get: (r: (typeof ROOMS)[number]) => (r.amenities.includes('tv') ? true : null) },
    { label: 'Desk', get: (r: (typeof ROOMS)[number]) => (r.features.some((f) => f.toLowerCase().includes('desk')) ? true : null) },
  ]

  return (
    <Section tone="sand" labelledBy="compare-heading">
      <div className="container-page">
        <h2 id="compare-heading" className="text-[length:var(--text-h2)]">
          Side by side
        </h2>
        <p className="mt-4 max-w-xl text-[length:var(--text-body-lg)] text-ink-soft">
          Everything that differs between the five rooms. Everything not listed here (Wi-Fi, hot
          water, power backup, parking, housekeeping) is the same in all of them.
        </p>

        <div className="mt-10 -mx-[var(--spacing-gutter)] overflow-x-auto px-[var(--spacing-gutter)]">
          <table className="w-full min-w-[42rem] border-collapse text-[0.875rem]">
            <caption className="sr-only">
              Room comparison by price, occupancy and facilities
            </caption>
            <thead>
              <tr>
                <th scope="col" className="w-40 border-b border-line-strong pb-4 text-left font-medium text-ink-mute">
                  <span className="text-[0.6875rem] tracking-[0.14em] uppercase">Compare</span>
                </th>
                {ROOMS.map((room) => (
                  <th
                    key={room.slug}
                    scope="col"
                    className="border-b border-line-strong pb-4 text-left align-bottom"
                  >
                    <Link href={`/rooms/${room.slug}`} className="font-display text-[1.0625rem] text-ink hover:text-brass-3 dark:hover:text-brass-2">
                      {room.shortName}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-line">
                  <th scope="row" className="py-3.5 pr-4 text-left font-normal text-ink-mute">
                    {row.label}
                  </th>
                  {ROOMS.map((room) => {
                    const value = row.get(room)
                    return (
                      <td key={room.slug} className="py-3.5 pr-4 text-ink tnum">
                        {value === true ? (
                          <>
                            <Check className="size-4 text-positive dark:text-brass-2" aria-hidden />
                            <span className="sr-only">Yes</span>
                          </>
                        ) : value === null ? (
                          <>
                            <Minus className="size-4 text-line-strong" aria-hidden />
                            <span className="sr-only">No</span>
                          </>
                        ) : (
                          value
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  )
}
