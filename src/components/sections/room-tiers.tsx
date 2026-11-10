import { Fan, Snowflake, Sparkles, Users } from 'lucide-react'
import { TierCta } from '@/components/booking/tier-cta'
import { Reveal } from '@/components/motion/reveal'
import { Section, SectionHeading } from '@/components/ui/section'
import { formatINR, ROOMS_BY_SLUG } from '@/content/rooms'
import { cn } from '@/lib/utils'

/**
 * Book-direct tiers — the three rooms the ERP can sell and take payment for
 * online, framed as a clear choice: Best Experience, Best Value, Budget
 * Friendly. Premium AC is the featured anchor; the two cheaper tiers each carry
 * an honest upgrade line computed from the real price gap (no invented
 * discounts, no hidden charges). The cheaper rooms are shown, not buried.
 *
 * The enquiry-only rooms (single, dormitory) are deliberately absent here — they
 * can't be paid for online — and stay in the full index (RoomsShowcase) and on
 * their own pages with the WhatsApp enquiry.
 */

const PREMIUM_AC = 'premium-ac-room'

type Tier = {
  slug: string
  badge: string
  featured?: boolean
  /** Honest, value-first upgrade line for the non-AC tiers. */
  upsell?: string
}

const TIERS: Tier[] = [
  {
    slug: PREMIUM_AC,
    badge: 'Best Experience',
    featured: true,
  },
  {
    slug: 'premium-room',
    badge: 'Best Value',
    upsell: 'Add air conditioning for ₹600 a night — the same room, cooler and quieter in summer.',
  },
  {
    slug: 'double-room',
    badge: 'Budget Friendly',
    upsell: 'Step up to the Premium AC, our quietest room, for ₹900 a night more.',
  },
]

export function RoomTiers() {
  return (
    <Section id="book-direct" tone="sand" labelledBy="book-direct-heading">
      <div className="container-page">
        <SectionHeading
          id="book-direct-heading"
          eyebrow="Book direct"
          title="Pick your room, pay securely, confirmed in seconds"
          lead="Every rate is the direct rate, taxes included, for two guests. Paid online through Razorpay and confirmed instantly — no waiting on a reply."
          className="max-w-2xl"
        />

        <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-3">
          {TIERS.map((tier, i) => (
            <TierCard key={tier.slug} tier={tier} delay={i * 80} />
          ))}
        </div>
      </div>
    </Section>
  )
}

function TierCard({ tier, delay }: { tier: Tier; delay: number }) {
  const room = ROOMS_BY_SLUG[tier.slug]
  if (!room) return null
  const premiumAc = ROOMS_BY_SLUG[PREMIUM_AC]
  const delta = premiumAc ? premiumAc.price - room.price : 0

  return (
    <Reveal delay={delay}>
      <div
        className={cn(
          'flex h-full flex-col rounded-[var(--radius-card)] border bg-paper p-6 lg:p-7',
          tier.featured
            ? 'border-brass shadow-[var(--shadow-lift)] ring-1 ring-brass/40'
            : 'border-line',
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.6875rem] font-medium tracking-[0.1em] uppercase',
              tier.featured ? 'bg-brass/15 text-brass-3 dark:text-brass-2' : 'bg-ink/5 text-ink-mute',
            )}
          >
            {tier.featured && <Sparkles className="size-3" aria-hidden />}
            {tier.badge}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[0.75rem] text-ink-mute">
            {room.ac ? (
              <Snowflake className="size-3.5 opacity-60" aria-hidden />
            ) : (
              <Fan className="size-3.5 opacity-60" aria-hidden />
            )}
            {room.ac ? 'AC' : 'Fan'}
          </span>
        </div>

        <h3 className="mt-5 text-[length:var(--text-h3)]">{room.name}</h3>

        <p className="mt-3 flex items-baseline gap-1.5">
          <span className="font-display text-[2rem] leading-none text-ink tnum">
            {formatINR(room.price)}
          </span>
          <span className="text-[0.8125rem] text-ink-mute">/ {room.priceUnit}</span>
        </p>

        <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-soft">{room.summary}</p>

        <ul className="mt-5 space-y-1.5 text-[0.8125rem] text-ink-mute">
          <li className="inline-flex items-center gap-2">
            <Users className="size-3.5 opacity-60" aria-hidden />
            Sleeps up to {room.occupancy.max} · {room.bed.split(',')[0]}
          </li>
        </ul>

        {/* Honest, value-first upsell on the cheaper tiers only. */}
        {tier.upsell && delta > 0 ? (
          <p className="mt-5 rounded-[var(--radius-card)] border border-dashed border-brass/50 bg-brass/5 p-3 text-[0.8125rem] leading-relaxed text-ink-soft">
            {tier.upsell}
          </p>
        ) : null}

        <div className="mt-auto">
          <TierCta slug={room.slug} source={`tier_${room.slug}`} featured={tier.featured} />
        </div>
      </div>
    </Reveal>
  )
}
