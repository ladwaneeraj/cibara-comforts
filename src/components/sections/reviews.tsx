import { ArrowUpRight, Quote, Star } from 'lucide-react'
import { Reveal } from '@/components/motion/reveal'
import { Section, SectionHeading } from '@/components/ui/section'
import { HOTEL } from '@/content/hotel'
import { HAS_VERIFIED_REVIEWS, VERIFIED_REVIEWS } from '@/content/reviews'
import { cn } from '@/lib/utils'

/**
 * Guest reviews.
 *
 * Two states, and the empty one is deliberate.
 *
 * Until real reviews are pasted into content/reviews.ts this renders the
 * aggregate rating and links straight out to Google, rather than showing
 * invented testimonials. Fabricated reviews are review fraud under Google's
 * policies, they are the first thing an alert guest checks, and a section that
 * honestly says "read all 312 on Google" converts better than three
 * suspiciously well-written quotes anyway.
 *
 * The moment `verified: true` entries exist, the card layout takes over
 * automatically. Nothing else needs changing.
 */
export function Reviews() {
  return (
    <Section id="reviews" tone="paper" labelledBy="reviews-heading">
      <div className="container-page">
        <SectionHeading
          id="reviews-heading"
          eyebrow="What guests say"
          title={`${HOTEL.rating.value} out of 5, across ${HOTEL.rating.count} reviews`}
          lead="We have not curated this. It is the public Google rating, and it includes the people who were not happy."
          align="center"
        />

        <Reveal delay={80} className="mt-10 flex flex-col items-center gap-6">
          <RatingSummary />
          <a
            href={HOTEL.links.maps}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-line-strong px-5 py-2.5 text-[0.875rem] font-medium text-ink transition-colors hover:border-ink"
          >
            Read every review on Google
            <ArrowUpRight className="size-4 text-brass transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </Reveal>

        {HAS_VERIFIED_REVIEWS && (
          <ul className="mt-16 grid gap-6 md:grid-cols-3">
            {VERIFIED_REVIEWS.slice(0, 3).map((review, i) => (
              <Reveal
                as="li"
                key={review.id}
                delay={i * 80}
                className="flex flex-col rounded-[var(--radius-card)] border border-line bg-paper-2 p-7"
              >
                <Quote className="size-5 text-brass" aria-hidden />
                <blockquote className="mt-5 flex-1 text-[1.0625rem] leading-relaxed text-ink">
                  {review.quote}
                </blockquote>
                <footer className="mt-6 border-t border-line pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <span>
                      <span className="block text-[0.875rem] font-medium text-ink">
                        {review.author}
                      </span>
                      <span className="mt-0.5 block text-[0.75rem] text-ink-mute">
                        {review.stayType} ·{' '}
                        {new Intl.DateTimeFormat('en-IN', {
                          month: 'long',
                          year: 'numeric',
                        }).format(new Date(review.date))}
                      </span>
                    </span>
                    <Stars value={review.rating} />
                  </div>
                  <p className="mt-3 text-[0.6875rem] tracking-[0.12em] text-ink-mute uppercase">
                    Verified {review.source} review
                  </p>
                </footer>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </Section>
  )
}

function RatingSummary() {
  return (
    <div className="flex items-center gap-5 rounded-[var(--radius-card)] border border-line bg-paper-2 px-7 py-5">
      <span className="font-display text-[3.25rem] leading-none text-ink tnum">
        {HOTEL.rating.value}
      </span>
      <span>
        <Stars value={Math.round(HOTEL.rating.value)} size="lg" />
        <span className="mt-2 block text-[0.8125rem] text-ink-mute">
          {HOTEL.rating.count} Google reviews · {HOTEL.foundedYear} to today
        </span>
      </span>
    </div>
  )
}

function Stars({ value, size = 'sm' }: { value: number; size?: 'sm' | 'lg' }) {
  return (
    <span
      className="inline-flex gap-0.5"
      role="img"
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden
          className={cn(
            size === 'lg' ? 'size-4' : 'size-3.5',
            n <= value ? 'fill-brass text-brass' : 'text-line-strong',
          )}
        />
      ))}
    </span>
  )
}
