import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'
import { Reveal } from '@/components/motion/reveal'
import { ClosingCta } from '@/components/sections/closing-cta'
import { Section } from '@/components/ui/section'
import { HOTEL } from '@/content/hotel'
import { breadcrumbNode, jsonLdGraph } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Policies', path: '/policies' },
]

export const metadata: Metadata = pageMetadata({
  title: 'House Rules and Cancellation Policy',
  description: `Check-in and check-out times, the cancellation policy, ID requirements, children, pets and smoking rules at ${HOTEL.name}, Harihar.`,
  path: '/policies',
})

const SECTIONS = [
  {
    heading: 'Check in and check out',
    items: [
      `Check-in from ${HOTEL.checkIn}. Check-out by ${HOTEL.checkOut}.`,
      'Reception is staffed 24 hours a day, every day of the year. There is no late check-in cut-off and no late arrival fee.',
      'Early check-in and late check-out are usually possible when the room is free. Ask on the day rather than booking ahead, and you will get a straight answer.',
    ],
  },
  {
    heading: 'Payment and cancellation',
    items: [
      HOTEL.policies.cancellation,
      `Payment is taken at the hotel. We accept ${HOTEL.payment.join(', ').toLowerCase()}.`,
      'No card details are taken at booking, because no card details are needed.',
      'If your plans change inside the 24 hour window, tell us anyway. In practice we would rather know than hold an empty room.',
    ],
  },
  {
    heading: 'Identification',
    items: [
      HOTEL.policies.id,
      'Aadhaar, driving licence, voter ID and passport are all accepted. Local IDs are fine.',
      'Foreign nationals need a passport and the visa page, which we are required to record.',
    ],
  },
  {
    heading: 'Children and extra guests',
    items: [
      HOTEL.policies.children,
      'Extra beds go into the Premium and Double rooms. The Single and the dormitory cannot take one.',
    ],
  },
  {
    heading: 'Pets',
    items: [
      HOTEL.policies.pets,
      'Pets should not be left alone in a room. If you need to go out, tell reception first.',
    ],
  },
  {
    heading: 'Smoking, alcohol and noise',
    items: [
      HOTEL.policies.smoking,
      'Drinking in your own room is your business. Drinking in the corridors is not, and we will ask you to stop.',
      'Please keep noise down after 10 PM. A large share of guests here have a train at five in the morning.',
    ],
  },
  {
    heading: 'Discounts',
    items: [HOTEL.policies.longStay, HOTEL.policies.groups],
  },
  {
    heading: 'Damage and lost property',
    items: [
      'Ordinary wear is expected and never charged for. Genuine damage is charged at cost, shown to you before it is applied.',
      'Lost property is held at reception for thirty days. Message on WhatsApp and we will look.',
    ],
  },
  {
    heading: 'Accessibility',
    items: [
      'The building is two floors and there is no lift. Ground floor rooms are available on request at no extra cost.',
      'Tell us at booking if stairs are a problem and a ground floor room will be set aside. This is the honest limitation of an older building.',
    ],
  },
]

export default function PoliciesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdGraph(breadcrumbNode(CRUMBS)) }}
      />

      <PageHeader
        crumbs={CRUMBS}
        eyebrow="House rules"
        titleLines={['The rules,', 'written plainly']}
        lead="Short, and with no clause designed to catch you out. If something here is unclear, ask before you book rather than after."
      />

      <Section tone="paper">
        <div className="container-narrow">
          <div className="divide-y divide-line border-y border-line">
            {SECTIONS.map((section, i) => (
              <Reveal
                key={section.heading}
                delay={i * 40}
                className="grid gap-4 py-8 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-10"
              >
                <h2 className="text-[length:var(--text-h3)]">{section.heading}</h2>
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li key={item.slice(0, 40)} className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink-soft">
                      <span aria-hidden className="mt-[0.7em] size-1 shrink-0 rounded-full bg-brass" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <ClosingCta />
    </>
  )
}
