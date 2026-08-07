import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { WhatsAppAction } from '@/components/booking/actions'
import { Reveal } from '@/components/motion/reveal'
import { Section, SectionHeading } from '@/components/ui/section'
import { AUDIENCES } from '@/content/audiences'
import { ROOMS_BY_SLUG } from '@/content/rooms'

/**
 * Guest segments.
 *
 * Self-identification is the cheapest conversion mechanism available. A
 * visitor who reads "wedding guests" and recognises their own situation stops
 * evaluating the property in the abstract and starts imagining their own stay,
 * and the abstract evaluation is the one a budget lodge loses.
 *
 * It is also the internal-linking spine: each card routes either to the room
 * that segment should book or to the landing page written for that search
 * intent, so the long-tail pages receive links from the homepage rather than
 * only from the footer.
 */
export function Audiences() {
  return (
    <Section tone="forest" labelledBy="audiences-heading">
      <div className="container-page">
        <SectionHeading
          id="audiences-heading"
          eyebrow="Who stays here"
          title="Seven very different reasons to be in Harihar"
          lead="A sales call in Davanagere and a wedding in the family need different things from a room. Find yourself below and we will point you at the right one."
          onDark
        />

        <ul className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius-card)] bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCES.map((audience, i) => {
            const room = ROOMS_BY_SLUG[audience.recommends]
            const href = audience.href ?? `/rooms/${audience.recommends}`
            return (
              <Reveal
                as="li"
                key={audience.id}
                delay={i * 55}
                className="group bg-forest transition-colors duration-500 hover:bg-forest-3 dark:bg-forest-2 dark:hover:bg-forest-3"
              >
                <Link href={href} className="flex h-full flex-col p-7 lg:p-8">
                  <audience.icon className="size-5 text-brass-2" aria-hidden />
                  <h3 className="mt-5 text-[1.125rem] text-cream">{audience.label}</h3>
                  <p className="mt-2.5 flex-1 text-[0.875rem] leading-relaxed text-cream-soft/90">
                    {audience.pitch}
                  </p>
                  <p className="mt-6 inline-flex items-center gap-1.5 text-[0.75rem] tracking-wide text-brass-2">
                    {audience.href ? 'Read more' : `We suggest the ${room?.shortName}`}
                    <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </p>
                </Link>
              </Reveal>
            )
          })}

          {/* Seven segments in a three-column grid leaves a hole. Rather than
              pad the list with a segment we do not really serve, the last cell
              catches everyone who did not see themselves above, which is the
              more useful thing to put there anyway. */}
          <Reveal
            as="li"
            delay={AUDIENCES.length * 55}
            className="bg-forest-3/60 sm:col-span-2 lg:col-span-2 dark:bg-forest-3/40"
          >
            <div className="flex h-full flex-col justify-center p-7 lg:p-8">
              <h3 className="text-[1.125rem] text-cream">None of the above?</h3>
              <p className="mt-2.5 max-w-md text-[0.875rem] leading-relaxed text-cream-soft/90">
                Tell us why you are coming to Harihar and reception will tell you which room to
                take, including when the answer is the cheapest one.
              </p>
              <WhatsAppAction
                source="audiences_catch_all"
                variant="onDark"
                size="sm"
                className="mt-6 self-start"
              >
                Ask which room suits you
              </WhatsAppAction>
            </div>
          </Reveal>
        </ul>
      </div>
    </Section>
  )
}
