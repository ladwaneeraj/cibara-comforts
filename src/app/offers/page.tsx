import { CalendarRange, Layers, PiggyBank, Users } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { WhatsAppAction } from '@/components/booking/actions'
import { PageHeader } from '@/components/layout/page-header'
import { Reveal } from '@/components/motion/reveal'
import { ClosingCta } from '@/components/sections/closing-cta'
import { Section, SectionHeading } from '@/components/ui/section'
import { HOTEL } from '@/content/hotel'
import { formatINR, ROOMS } from '@/content/rooms'
import { breadcrumbNode, jsonLdGraph } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Offers', path: '/offers' },
]

export const metadata: Metadata = pageMetadata({
  title: 'Offers, Group Rates and Long Stays',
  description: `Standing offers at ${HOTEL.name}: 15% off from 7 nights, group rates from 3 rooms, children under 5 free, and direct booking below OTA prices.`,
  path: '/offers',
})

/**
 * Offers.
 *
 * Standing arrangements only, deliberately. No countdown timers, no "3 people
 * are viewing", no invented flash sale. Manufactured urgency on a ₹450 room
 * reads as desperate and it is the single fastest way to undo the trust the
 * rest of the site is built to earn. These four are real, permanent, and
 * verifiable at the desk.
 */
const OFFERS = [
  {
    icon: PiggyBank,
    title: 'Direct is cheaper, always',
    saving: 'Roughly 15 to 20%',
    body: `Booking.com, MakeMyTrip and Goibibo charge us a commission of about 15 to 20 percent, which has to be priced into their listings. Book on WhatsApp or by phone and that cost is not in the transaction at all. This is not a promotion, it is arithmetic, and it applies every day of the year.`,
    cta: 'Book direct on WhatsApp',
  },
  {
    icon: CalendarRange,
    title: 'Seven nights or more',
    saving: '15% off',
    body: `Applied automatically to any stay of seven nights or longer, on any room including the dormitory. No code and nothing to ask for. Contractors, engineers on a commissioning job and students taking exams in Davanagere are the usual takers.`,
    cta: 'Ask about a long stay',
  },
  {
    icon: Users,
    title: 'Three rooms or more',
    saving: 'Custom rate',
    body: `A negotiated rate rather than a fixed discount, because it depends on the dates and how full we are. Complimentary breakfast on request. Rooms are held with no advance payment, which is what wedding families and company visits actually need.`,
    cta: 'Ask for a group rate',
  },
  {
    icon: Layers,
    title: 'Children and extra beds',
    saving: 'Under 5 stay free',
    body: `Children under five stay free using existing bedding, and cribs are free on request. Beyond that, an extra guest in a room is ₹300 a night, which is normally cheaper than a second room for a family of three or four.`,
    cta: 'Ask about a family room',
  },
]

export default function OffersPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdGraph(breadcrumbNode(CRUMBS)) }}
      />

      <PageHeader
        crumbs={CRUMBS}
        eyebrow="Standing offers"
        titleLines={['Four real discounts,', 'no countdown timers']}
        lead="There is no flash sale here and there never will be. What follows are four standing arrangements that apply every day of the year, and any of them can be verified at the desk."
      />

      <Section tone="paper">
        <div className="container-page">
          <ul className="grid gap-6 lg:grid-cols-2">
            {OFFERS.map((offer, i) => (
              <Reveal
                as="li"
                key={offer.title}
                delay={i * 70}
                className="flex flex-col rounded-[var(--radius-card)] border border-line bg-paper-2 p-7 lg:p-9"
              >
                <div className="flex items-start justify-between gap-6">
                  <offer.icon className="size-6 text-brass" aria-hidden />
                  <span className="rounded-full bg-brass/12 px-3 py-1 text-[0.75rem] font-medium text-brass-3 dark:bg-brass/20 dark:text-brass-2">
                    {offer.saving}
                  </span>
                </div>
                <h2 className="mt-6 text-[length:var(--text-h3)]">{offer.title}</h2>
                <p className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-ink-soft">
                  {offer.body}
                </p>
                <WhatsAppAction
                  source={`offer_${offer.title.toLowerCase().replace(/\W+/g, '_')}`}
                  variant="outline"
                  className="mt-7 self-start"
                >
                  {offer.cta}
                </WhatsAppAction>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="sand" labelledBy="rate-card">
        <div className="container-page">
          <SectionHeading
            id="rate-card"
            eyebrow="The rate card"
            title="What everything costs before any discount"
            lead="Direct rates, taxes included, for the standard occupancy shown. Extra guests are ₹300 per night in any room that takes them."
          />

          <Reveal delay={80}>
            <ul className="mt-12 divide-y divide-line border-y border-line">
              {ROOMS.map((room) => (
                <li key={room.slug}>
                  <Link
                    href={`/rooms/${room.slug}`}
                    className="group grid gap-2 py-5 sm:grid-cols-[minmax(0,1fr)_8rem_8rem] sm:items-baseline sm:gap-8"
                  >
                    <span>
                      <span className="block text-[1.0625rem] font-display text-ink transition-colors group-hover:text-brass-3 dark:group-hover:text-brass-2">
                        {room.name}
                      </span>
                      <span className="mt-1 block text-[0.8125rem] text-ink-mute">
                        {room.summary}
                      </span>
                    </span>
                    <span className="text-[0.8125rem] text-ink-mute">
                      {room.occupancy.standard} {room.occupancy.standard === 1 ? 'guest' : 'guests'},
                      up to {room.occupancy.max}
                    </span>
                    <span className="text-[1.125rem] text-ink tnum sm:text-right">
                      {formatINR(room.price)}
                      <span className="ml-1 text-[0.75rem] text-ink-mute">/ {room.priceUnit}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-8 max-w-2xl text-[0.875rem] leading-relaxed text-ink-mute">
              {HOTEL.policies.cancellation} Payment is taken at the hotel by{' '}
              {HOTEL.payment.slice(0, 4).join(', ').toLowerCase()} or bank transfer.
            </p>
          </Reveal>
        </div>
      </Section>

      <ClosingCta />
    </>
  )
}
