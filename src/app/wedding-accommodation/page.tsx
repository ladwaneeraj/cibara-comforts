import { CalendarCheck, HandCoins, MessagesSquare, Users } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { WhatsAppAction } from '@/components/booking/actions'
import { PageHeader } from '@/components/layout/page-header'
import { Reveal } from '@/components/motion/reveal'
import { ClosingCta } from '@/components/sections/closing-cta'
import { Prose } from '@/components/ui/prose'
import { Section } from '@/components/ui/section'
import { HOTEL } from '@/content/hotel'
import { formatINR, ROOMS } from '@/content/rooms'
import { breadcrumbNode, jsonLdGraph } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Wedding accommodation', path: '/wedding-accommodation' },
]

export const metadata: Metadata = pageMetadata({
  title: 'Wedding Guest Accommodation in Harihar',
  description: `Room blocks for wedding parties in Harihar. Hold five rooms or more with no advance payment, a group rate, and one WhatsApp contact for the whole family.`,
  path: '/wedding-accommodation',
  image: '/og/room-premium-ac-room.jpg',
})

const BODY = `
## The problem you are actually solving

Somebody in the family has been given the job of housing thirty relatives for two nights, in a town where the hall is booked and the hotels are not. That person is usually doing it on WhatsApp, in a group, while also being asked about the catering.

What makes that job easier is not a booking engine. It is one number to message, a block of rooms held without money changing hands, and a straight answer about how many rooms are actually free on those dates.

## How a block works here

1. **Message the dates and a rough headcount.** WhatsApp is fastest. You do not need a final list.
2. **We tell you what can be held.** Honestly, including if the answer is "eleven rooms, not twenty".
3. **The block is held with no payment.** Nothing is charged and nothing is committed until people arrive.
4. **Names come later.** Send them a few days before, or hand them in at the desk on the day.
5. **One person can settle everything**, or each family can pay for their own room. Both work.

## The mix most families end up with

Elders and couples in the **Premium AC** rooms, which are the quietest and the only air conditioned ones. Middle generation in the **Premium non-AC** or **Double** rooms. Younger cousins in **Singles**, or in the **dormitory** at ₹250 a bed, which for a group of college-age boys is usually the popular option anyway.

Extra beds go into the Premium and Double rooms at ₹300 per person, so a family of four fits in one room where they would otherwise need two.

## Rates

From three rooms there is a group rate, and complimentary breakfast on request. From five rooms it is worth a conversation about the whole block rather than a per-room number.

Children under five stay free on existing bedding. Cribs are available and there is no charge for them.

## Practical things that come up at weddings

- **Late nights are fine.** Reception is staffed 24 hours, so people coming back from the hall at two in the morning is not a problem and nobody needs a key deposit.
- **Free parking** on site, under CCTV, which matters when the family arrives in six cars.
- **Laundry**, same day if in before ten, which matters more at a three-day wedding than people expect.
- **Ironing and getting ready.** Ask reception. There is a common area and it is not a problem.
- **Elderly guests.** The building is two floors with no lift. Tell us and we will put them on the ground floor.

## Where the hall is

Most weddings we house are within a few kilometres, and autos are cheap and plentiful. If you tell us the venue we will tell you the realistic travel time and what a car should cost, so you can plan the muhurta timings around it rather than the other way round.
`

export default function WeddingPage() {
  const steps = [
    { icon: MessagesSquare, label: 'One WhatsApp number for the whole family' },
    { icon: CalendarCheck, label: 'Rooms held without any advance payment' },
    { icon: HandCoins, label: 'Group rate from three rooms' },
    { icon: Users, label: 'Extra beds at ₹300 so families share' },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdGraph(breadcrumbNode(CRUMBS)) }}
      />

      <PageHeader
        crumbs={CRUMBS}
        eyebrow="Room blocks for wedding parties"
        titleLines={['Thirty relatives,', 'two nights, one number']}
        lead="If housing the family has landed on you, this page is written for you rather than for the couple. Blocks are held free, the rate is negotiable, and one person can sort the whole thing on WhatsApp."
      >
        <div className="flex flex-wrap gap-3">
          <WhatsAppAction source="wedding_page" size="lg">
            Ask about a block
          </WhatsAppAction>
          <Link
            href="/rooms"
            className="inline-flex h-[3.375rem] items-center rounded-full border border-line-strong px-8 text-base font-medium text-ink transition-colors hover:border-ink"
          >
            Rooms and rates
          </Link>
        </div>
      </PageHeader>

      <Section tone="paper">
        <div className="container-page">
          <ul className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((item, i) => (
              <Reveal as="li" key={item.label} delay={i * 60} className="bg-paper p-6">
                <item.icon className="size-5 text-brass" aria-hidden />
                <p className="mt-4 text-[0.9375rem] leading-snug text-ink">{item.label}</p>
              </Reveal>
            ))}
          </ul>

          <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-20">
            <Prose source={BODY} />

            <Reveal delay={80} className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-[var(--radius-card)] border border-line bg-paper-2 p-7">
                <h2 className="text-[0.6875rem] tracking-[0.14em] text-ink-mute uppercase">
                  Rates for the block
                </h2>
                <ul className="mt-4 divide-y divide-line">
                  {ROOMS.map((room) => (
                    <li key={room.slug}>
                      <Link
                        href={`/rooms/${room.slug}`}
                        className="flex items-baseline justify-between gap-4 py-3 text-[0.9375rem]"
                      >
                        <span className="text-ink-soft">{room.shortName}</span>
                        <span className="text-ink tnum">{formatINR(room.price)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 border-t border-line pt-5 text-[0.8125rem] leading-relaxed text-ink-mute">
                  Published rates. A block of three or more gets less than this. Message{' '}
                  {HOTEL.contact.phoneDisplay} with your dates and headcount for a number.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      <ClosingCta />
    </>
  )
}
