import { FileText, Plug, Receipt, Wifi } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { WhatsAppAction } from '@/components/booking/actions'
import { PageHeader } from '@/components/layout/page-header'
import { Reveal } from '@/components/motion/reveal'
import { ClosingCta } from '@/components/sections/closing-cta'
import { Prose } from '@/components/ui/prose'
import { Section } from '@/components/ui/section'
import { HOTEL } from '@/content/hotel'
import { formatINR, ROOMS_BY_SLUG } from '@/content/rooms'
import { breadcrumbNode, jsonLdGraph } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Corporate stays', path: '/corporate-stays' },
]

export const metadata: Metadata = pageMetadata({
  title: 'Corporate and Business Stays',
  description: `GST invoices, monthly billing, a desk in every room, power backup and negotiated rates from three rooms. Business accommodation in Harihar, near Davanagere.`,
  path: '/corporate-stays',
  image: '/og/room-double-room.jpg',
})

const BODY = `
## What a company visit to Harihar usually looks like

Most business travel here is one or two nights: a plant visit, a distributor meeting, a site inspection, a medical or agri-input sales round through Harihar, Davanagere, Ranebennur and Hospet. People arrive by train or by company car, work all day, and need a room that is quiet, has a desk, and has power that stays on.

Davanagere is fifteen kilometres away and has business hotels at two to three times the rate. If your meeting is in Harihar, staying in Harihar saves an hour of driving a day and most of the accommodation budget.

## Billing that your accounts team will accept

GST invoices are issued as standard. Give us your company GSTIN at check-in, or send it on WhatsApp before you arrive, and the invoice will be ready when you leave rather than promised by email.

For companies whose people come through regularly, we can run a monthly consolidated invoice against a single account rather than one bill per stay. That is normally easier for everyone: your team stops filing individual reimbursements and we stop chasing them.

## Rates

Published rates apply for one or two rooms. From three rooms, or from a pattern of repeat visits, there is a negotiated rate. Message the expected volume and reception will give you a number rather than a range.

Long stays of seven nights or more get 15 percent off as standard, without needing to negotiate anything. Engineers on a commissioning job or auditors on a two-week engagement usually fall into this.

## What the room actually gives you

- A **desk and chair** in every private room, not a dressing table with a stool.
- **Wi-Fi with access points on every floor**, adequate for video calls. Not a lobby-only hotspot.
- **Power backup** on lights, fans and Wi-Fi, so a cut does not end a call. Air conditioning does not run on the generator, which is the honest limitation.
- **Free parking** on site, under CCTV, for a company car left overnight.
- **24 hour reception**, because a delayed train from Bengaluru is the normal case.
- **Laundry**, same day if it is in before ten.
`

export default function CorporatePage() {
  const room = ROOMS_BY_SLUG['double-room']
  const highlights = [
    { icon: Receipt, label: 'GST invoices as standard' },
    { icon: FileText, label: 'Monthly consolidated billing' },
    { icon: Wifi, label: 'Wi-Fi that handles video calls' },
    { icon: Plug, label: 'Power backup on lights and Wi-Fi' },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdGraph(breadcrumbNode(CRUMBS)) }}
      />

      <PageHeader
        crumbs={CRUMBS}
        eyebrow="For companies and business travellers"
        titleLines={['A desk, a socket,', 'and an invoice that works']}
        lead="Harihar is a working town and a good share of our guests are here for work. This page is the part of the conversation your accounts department cares about."
      >
        <div className="flex flex-wrap gap-3">
          <WhatsAppAction source="corporate_page" size="lg">
            Ask for a corporate rate
          </WhatsAppAction>
          <Link
            href="/rooms"
            className="inline-flex h-[3.375rem] items-center rounded-full border border-line-strong px-8 text-base font-medium text-ink transition-colors hover:border-ink"
          >
            See the rooms
          </Link>
        </div>
      </PageHeader>

      <Section tone="paper">
        <div className="container-page">
          <ul className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item, i) => (
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
                  Usually booked for work
                </h2>
                {room && (
                  <Link href={`/rooms/${room.slug}`} className="group mt-4 block">
                    <p className="font-display text-[1.375rem] text-ink group-hover:text-brass-3 dark:group-hover:text-brass-2">
                      {room.name}
                    </p>
                    <p className="mt-1 text-[0.875rem] text-ink-mute tnum">
                      {formatINR(room.price)} per night, desk and en-suite
                    </p>
                  </Link>
                )}
                <dl className="mt-6 space-y-3 border-t border-line pt-6 text-[0.875rem]">
                  <Row label="Group rate from" value="3 rooms" />
                  <Row label="Long-stay discount" value="15% from 7 nights" />
                  <Row label="GST invoice" value="On request at check-in" />
                  <Row label="Payment" value="Cash, UPI or transfer" />
                  <Row label="Cancellation" value="Free until 24h before" />
                </dl>
                <p className="mt-6 border-t border-line pt-6 text-[0.8125rem] leading-relaxed text-ink-mute">
                  Send your GSTIN and expected dates on WhatsApp to {HOTEL.contact.phoneDisplay} and
                  reception will confirm a rate the same day.
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink-mute">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  )
}
