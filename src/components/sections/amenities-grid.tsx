import Link from 'next/link'
import { Reveal } from '@/components/motion/reveal'
import { Section, SectionHeading } from '@/components/ui/section'
import { AMENITIES, HEADLINE_AMENITIES } from '@/content/amenities'

/**
 * Amenities.
 *
 * Every item carries a clarifying line, because on a budget listing the
 * amenity word alone is worthless. "Hot water" appears on every lodge in
 * Harihar; "hot water all day, not a two hour morning window" is the sentence
 * that wins the booking, and it is the one a guest remembers.
 *
 * Six headline amenities in the grid and the long tail in a plain list below.
 * Fourteen equally weighted tiles is a spec sheet, not a section.
 */
export function AmenitiesGrid() {
  const secondary = AMENITIES.filter((a) => !a.headline)

  return (
    <Section id="amenities" tone="paper" labelledBy="amenities-heading">
      <div className="container-page">
        <SectionHeading
          id="amenities-heading"
          eyebrow="What is included"
          title="The things that actually decide whether a night was good"
          lead="No spa, no rooftop bar, no infinity pool. What follows is the list we would want if we were the ones arriving at midnight."
        />

        <ul className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {HEADLINE_AMENITIES.map((amenity, i) => (
            <Reveal
              as="li"
              key={amenity.id}
              delay={i * 60}
              className="group bg-paper p-7 transition-colors duration-500 hover:bg-paper-2 lg:p-8"
            >
              <amenity.icon
                className="size-6 text-brass transition-transform duration-500 ease-[var(--ease-swift)] group-hover:-translate-y-0.5"
                aria-hidden
              />
              <h3 className="mt-5 text-[1.0625rem] font-medium tracking-tight text-ink">
                {amenity.label}
              </h3>
              <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-mute">{amenity.detail}</p>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={120} className="mt-8">
          <p className="text-[0.875rem] text-ink-mute">
            Also here:{' '}
            {secondary.map((a, i) => (
              <span key={a.id}>
                <span className="text-ink-soft">{a.label.toLowerCase()}</span>
                <span className="text-ink-mute/70"> ({a.detail.toLowerCase()})</span>
                {i < secondary.length - 1 ? ', ' : '. '}
              </span>
            ))}
            <Link href="/faq" className="underline decoration-brass underline-offset-4">
              Anything else, just ask
            </Link>
            .
          </p>
        </Reveal>
      </div>
    </Section>
  )
}
