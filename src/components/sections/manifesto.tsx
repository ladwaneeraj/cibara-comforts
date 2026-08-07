import { Reveal } from '@/components/motion/reveal'
import { Picture } from '@/components/media/picture'
import { Section } from '@/components/ui/section'

/**
 * Positioning statement.
 *
 * The strategic bet of the whole site sits in this section.
 *
 * A ₹450 lodge that claims to be a luxury hotel gets found out in the first
 * photograph and loses the booking. A ₹450 lodge that states plainly what it
 * is, and then shows unusual care in how it says it, reads as more trustworthy
 * than either a budget listing or an over-claiming one. Refusing to oversell
 * is itself the premium signal, and it is the only one available that a
 * competitor cannot copy by hiring a better photographer.
 *
 * The pull quote is set large in the display serif and given a full column of
 * whitespace, because typographic confidence is what carries "expensive" when
 * the photography cannot.
 */
export function Manifesto() {
  return (
    <Section tone="sand">
      <div className="container-page">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-20">
          <div>
            <Reveal>
              <p className="eyebrow">
                <span aria-hidden className="h-px w-6 bg-current opacity-60" />
                What this place is
              </p>
            </Reveal>

            <Reveal delay={80}>
              <p className="mt-7 font-display text-[clamp(1.75rem,1.15rem+2.6vw,3.25rem)] leading-[1.14] tracking-[-0.02em] text-ink">
                We are not a luxury hotel.
                <br />
                <span className="text-brass-3 dark:text-brass-2">We are a very good one.</span>
              </p>
            </Reveal>

            <div className="mt-8 max-w-xl space-y-5 text-[length:var(--text-body-lg)] leading-relaxed text-ink-soft">
              <Reveal delay={140}>
                <p>
                  The floors are hand-laid cement tile, not marble. The wall discs are cane, made in
                  this district. The green on the walls is the green you will find on half the old
                  buildings in Harihar, because that is where we got the idea.
                </p>
              </Reveal>
              <Reveal delay={200}>
                <p>
                  What we spend money on is the part you sleep on and wash in. Firm mattresses.
                  Linen changed between every guest. Hot water at three in the morning, not for two
                  hours after sunrise. A generator that keeps the fan running through a cut.
                </p>
              </Reveal>
              <Reveal delay={260}>
                <p className="text-ink">
                  Fifteen thousand people have stayed here since 2016. A fair number of them come
                  back, which is the only review that has ever mattered to us.
                </p>
              </Reveal>
            </div>
          </div>

          <Reveal delay={120} className="relative">
            <Picture
              id="premium2"
              alt="An electric kettle, two cups and a complimentary tea tray set out beside the bed in a Premium room at Cibara Comforts"
              sizes="(min-width: 1024px) 40vw, 100vw"
              ratio="4 / 5"
              focal="34% 58%"
              className="rounded-[var(--radius-image)] shadow-[var(--shadow-lift)]"
            />
            <figcaption className="mt-4 flex items-start gap-3 text-caption text-ink-mute">
              <span aria-hidden className="mt-2 h-px w-6 shrink-0 bg-brass" />
              The kettle is yours for the night. Tea and coffee are restocked every morning, and
              nobody has ever been charged for them.
            </figcaption>
          </Reveal>
        </div>
      </div>
    </Section>
  )
}
