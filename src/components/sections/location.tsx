import { Footprints } from 'lucide-react'
import Link from 'next/link'
import { DirectionsAction } from '@/components/booking/actions'
import { Reveal } from '@/components/motion/reveal'
import { MapEmbed } from '@/components/sections/map-embed'
import { Section, SectionHeading } from '@/components/ui/section'
import { NEARBY } from '@/content/nearby'
import { cn } from '@/lib/utils'

/**
 * Location.
 *
 * Distances are given in walking minutes wherever a person would plausibly
 * walk it, and in kilometres where they would not. "800 metres" is an
 * abstraction; "ten minutes on foot, three by auto" is a decision a tired
 * traveller can act on, and it is the actual reason this property beats one on
 * the far side of town.
 *
 * The list doubles as the location-SEO surface. Each named place is an entity
 * a search engine can match a query against, and each is repeated in the
 * page's structured data.
 */
export function Location() {
  return (
    <Section id="location" tone="sand" labelledBy="location-heading">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <SectionHeading
              id="location-heading"
              eyebrow="Getting here"
              title="Ten minutes from the platform, on foot"
              lead="Harihar sits on the Bengaluru to Hubballi line and five minutes off NH-48. We are between the railway station and the KSRTC bus stand, which is the whole reason this building is where it is."
            />

            <Reveal delay={120} className="mt-9 flex flex-wrap gap-3">
              <DirectionsAction source="location_section" variant="primary" />
              <Link
                href="/location"
                className="inline-flex h-12 items-center rounded-full border border-line-strong px-6 text-[0.9375rem] font-medium text-ink transition-colors hover:border-ink"
              >
                Full directions and transport
              </Link>
            </Reveal>

            <Reveal delay={180}>
              <ul className="mt-11 divide-y divide-line border-y border-line">
                {NEARBY.map((place) => (
                  <li key={place.id} className="flex items-baseline gap-4 py-3.5">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.9375rem] text-ink">{place.name}</span>
                      <span className="mt-0.5 block text-[0.8125rem] leading-snug text-ink-mute">
                        {place.note}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[0.9375rem] text-ink tnum">
                        {place.km < 1 ? `${place.km * 1000} m` : `${place.km} km`}
                      </span>
                      {place.walkMinutes !== null && (
                        <span
                          className={cn(
                            'mt-0.5 inline-flex items-center gap-1 text-[0.75rem] text-brass-3',
                            'dark:text-brass-2',
                          )}
                        >
                          <Footprints className="size-3" aria-hidden />
                          {place.walkMinutes} min walk
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={80} className="lg:sticky lg:top-28 lg:self-start">
            <MapEmbed className="aspect-[4/5] w-full sm:aspect-[4/3] lg:aspect-[3/4]" />
          </Reveal>
        </div>
      </div>
    </Section>
  )
}
