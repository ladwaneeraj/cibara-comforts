import { Bus, Car, Footprints, Plane, TrainFront } from 'lucide-react'
import type { Metadata } from 'next'
import { CallAction, DirectionsAction } from '@/components/booking/actions'
import { PageHeader } from '@/components/layout/page-header'
import { Reveal } from '@/components/motion/reveal'
import { ClosingCta } from '@/components/sections/closing-cta'
import { MapEmbed } from '@/components/sections/map-embed'
import { Section, SectionHeading } from '@/components/ui/section'
import { FULL_ADDRESS, HOTEL } from '@/content/hotel'
import { NEARBY } from '@/content/nearby'
import { breadcrumbNode, jsonLdGraph, placeNode } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Getting here', path: '/location' },
]

export const metadata: Metadata = pageMetadata({
  title: 'Directions, Trains and Buses',
  description: `Reaching ${HOTEL.name}: 800m from Harihar railway station, 750m from the KSRTC bus stand, 5 minutes off NH-48. Walking, auto, train and driving directions.`,
  path: '/location',
  image: '/og/location.jpg',
})

/**
 * Arrival routes.
 *
 * Written as instructions rather than descriptions. Somebody reading this is
 * usually already in transit, often on a phone with one bar of signal, and
 * what they need is the next physical action, the realistic cost and the name
 * of the landmark to say to an auto driver.
 */
const ROUTES = [
  {
    icon: TrainFront,
    title: 'From Harihar railway station',
    time: '10 minutes on foot, 3 by auto',
    steps: [
      'Leave by the main exit and turn right onto the station road.',
      'Walk straight for about 700 metres towards the KSRTC bus stand.',
      'We are on the left, just before the bus stand. Look for the Cibara Comforts board.',
      'By auto it should be ₹30 to ₹50. Say "Cibara Comforts, KSRTC bus stand ke pass".',
    ],
  },
  {
    icon: Bus,
    title: 'From the KSRTC bus stand',
    time: '9 minutes on foot',
    steps: [
      'Exit towards the main road and turn towards the railway station side.',
      'We are roughly 750 metres along, on the right.',
      'If you are arriving after dark, message on WhatsApp and reception will stay watching for you.',
    ],
  },
  {
    icon: Car,
    title: 'Driving on NH-48',
    time: '5 minutes off the highway',
    steps: [
      'Coming from Bengaluru, Harihar is around 270 km, roughly 4 to 5 hours.',
      'Coming from Hubballi it is about 120 km, roughly 2 hours.',
      'Take the Harihar town exit and head towards the KSRTC bus stand.',
      'Free parking on site for cars and two-wheelers, under CCTV. No need to reserve.',
    ],
  },
  {
    icon: Plane,
    title: 'By air',
    time: 'Nearest airports',
    steps: [
      'Hubballi (HBX) is about 125 km, two and a half hours by road.',
      'Bengaluru (BLR) is about 300 km. Most guests take the train from there instead.',
      'There are frequent trains and buses from both towards Harihar.',
    ],
  },
]

export default function LocationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdGraph(
            breadcrumbNode(CRUMBS),
            ...NEARBY.map((n) => placeNode(n.id)),
          ),
        }}
      />

      <PageHeader
        crumbs={CRUMBS}
        eyebrow="Harihar, Karnataka 577601"
        titleLines={['Between the platform', 'and the bus stand']}
        lead={
          <>
            {FULL_ADDRESS}. Eight hundred metres from Harihar railway station, seven hundred and
            fifty from the KSRTC bus stand, and five minutes off NH-48. That position is the whole
            reason this building is here.
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <DirectionsAction source="location_page" variant="primary" size="lg" />
          <CallAction source="location_page" size="lg">
            Call if you are lost
          </CallAction>
        </div>
      </PageHeader>

      <Section tone="paper">
        <div className="container-page">
          <MapEmbed className="aspect-[4/3] w-full lg:aspect-[21/9]" />
        </div>
      </Section>

      <Section tone="sand" labelledBy="routes-heading" className="!pt-0">
        <div className="container-page pt-[var(--spacing-section)]">
          <SectionHeading
            id="routes-heading"
            eyebrow="Arriving"
            title="Four ways in, written as instructions"
            lead="If you are already moving and short on signal, this is the part to screenshot."
          />

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {ROUTES.map((route, i) => (
              <Reveal
                key={route.title}
                delay={i * 70}
                className="rounded-[var(--radius-card)] border border-line bg-paper p-7 lg:p-8"
              >
                <route.icon className="size-6 text-brass" aria-hidden />
                <h3 className="mt-5 text-[length:var(--text-h3)]">{route.title}</h3>
                <p className="mt-1.5 text-[0.8125rem] tracking-[0.1em] text-ink-mute uppercase">
                  {route.time}
                </p>
                <ol className="mt-5 space-y-3">
                  {route.steps.map((step, n) => (
                    <li key={step} className="flex gap-4 text-[0.9375rem] leading-relaxed text-ink-soft">
                      <span
                        aria-hidden
                        className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-line text-[0.625rem] text-ink-mute tnum"
                      >
                        {n + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="paper" labelledBy="nearby-heading">
        <div className="container-page">
          <SectionHeading
            id="nearby-heading"
            eyebrow="Around us"
            title="What is nearby, and how far it really is"
          />

          <Reveal delay={80}>
            <ul className="mt-12 divide-y divide-line border-y border-line">
              {NEARBY.map((place) => (
                <li key={place.id} className="grid gap-2 py-5 sm:grid-cols-[minmax(0,1fr)_10rem] sm:gap-8">
                  <div>
                    <h3 className="text-[1.0625rem] font-display text-ink">{place.name}</h3>
                    <p className="mt-1 text-[0.875rem] leading-relaxed text-ink-mute">{place.note}</p>
                  </div>
                  <p className="sm:text-right">
                    <span className="text-[1.0625rem] text-ink tnum">
                      {place.km < 1 ? `${place.km * 1000} m` : `${place.km} km`}
                    </span>
                    {place.walkMinutes !== null && (
                      <span className="mt-0.5 flex items-center gap-1 text-[0.8125rem] text-brass-3 sm:justify-end dark:text-brass-2">
                        <Footprints className="size-3" aria-hidden />
                        {place.walkMinutes} minute walk
                      </span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      <ClosingCta />
    </>
  )
}
