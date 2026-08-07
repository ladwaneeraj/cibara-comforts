import { Reveal } from '@/components/motion/reveal'
import { HOTEL } from '@/content/hotel'

/**
 * Trust strip.
 *
 * Four numbers, hairline separated, no icons and no badges. Numbers with a
 * verifiable source read as confidence; badge graphics read as a template.
 * Every figure here is checkable against the Google Business Profile, which
 * matters because a claim a guest can verify is worth several a guest cannot.
 */
export function TrustStrip() {
  return (
    <section aria-label="At a glance" className="border-y border-line bg-paper">
      <div className="container-page">
        {/* Hairlines between cells only, never around the outside: a boxed
            grid reads as a widget, an open one reads as a page. */}
        <dl className="grid grid-cols-2 md:grid-cols-4">
          {HOTEL.stats.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 70}
              className="border-line py-8 pr-4 not-first:border-l not-first:pl-4 md:py-11 md:pr-8 md:not-first:pl-8 [&:nth-child(3)]:border-l-0 [&:nth-child(3)]:pl-0 md:[&:nth-child(3)]:border-l md:[&:nth-child(3)]:pl-8 [&:nth-child(-n+2)]:border-b md:[&:nth-child(-n+2)]:border-b-0"
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-display text-[clamp(2rem,1.4rem+2.4vw,3rem)] leading-none text-ink tnum">
                  {stat.value}
                  <span className="text-brass">{stat.unit}</span>
                </span>
                <span className="mt-3 block max-w-[16ch] text-[0.8125rem] leading-snug text-ink-mute">
                  {stat.label}
                </span>
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  )
}
