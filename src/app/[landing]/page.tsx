import { ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BookingBar } from '@/components/booking/booking-bar'
import { PageHeader } from '@/components/layout/page-header'
import { Picture } from '@/components/media/picture'
import { Reveal } from '@/components/motion/reveal'
import { ClosingCta } from '@/components/sections/closing-cta'
import { Faqs } from '@/components/sections/faq'
import { Section } from '@/components/ui/section'
import { HOMEPAGE_FAQS, type Faq } from '@/content/faqs'
import { LANDING_BY_SLUG, LANDING_PAGES } from '@/content/landing-pages'
import { formatINR, ROOMS_BY_SLUG } from '@/content/rooms'
import { breadcrumbNode, faqNode, jsonLdGraph } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'

/**
 * Location and intent landing pages, rendered from src/content/landing-pages.ts.
 *
 * A root-level dynamic segment. Next resolves static segments (/rooms,
 * /gallery) before dynamic ones, and `generateStaticParams` enumerates exactly
 * the four slugs that exist, so nothing else can fall through here.
 *
 * These pages exist to rank for high-intent long-tail queries. What keeps them
 * on the right side of Google's doorway-page guidance is that each carries
 * substantive, distinct, genuinely useful content written for that specific
 * intent, including advice that sends the reader elsewhere when elsewhere is
 * the better answer.
 */
export function generateStaticParams() {
  return LANDING_PAGES.map((page) => ({ landing: page.slug }))
}

type Props = { params: Promise<{ landing: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { landing } = await params
  const page = LANDING_BY_SLUG[landing]
  if (!page) return {}

  return {
    ...pageMetadata({
      title: page.title,
      description: page.metaDescription,
      path: `/${page.slug}`,
      image: `/media/${page.heroImage}/fallback.jpg`,
    }),
    title: { absolute: page.title },
  }
}

export default async function LandingPage({ params }: Props) {
  const { landing } = await params
  const page = LANDING_BY_SLUG[landing]
  if (!page) notFound()

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: page.eyebrow, path: `/${page.slug}` },
  ]

  const faqs: Faq[] = [
    ...page.faqs.map((f) => ({ ...f, category: 'location' as const })),
    ...HOMEPAGE_FAQS.slice(0, 4),
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdGraph(breadcrumbNode(crumbs), faqNode(faqs)),
        }}
      />

      <PageHeader
        crumbs={crumbs}
        eyebrow={page.eyebrow}
        titleLines={page.headingLines}
        lead={page.lead}
      >
        <BookingBar source={`landing_${page.slug}`} variant="inline" className="max-w-3xl" />
      </PageHeader>

      <Section tone="paper" className="!pb-0">
        <div className="container-page">
          <Reveal>
            <Picture
              id={page.heroImage}
              alt={`A room at Cibara Comforts, ${page.eyebrow.toLowerCase()}`}
              sizes="100vw"
              ratio="21 / 9"
              priority
              className="rounded-[var(--radius-card)]"
            />
          </Reveal>

          <Reveal delay={80}>
            <dl className="mt-8 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {page.facts.map((fact) => (
                <div key={fact.label} className="bg-paper p-5">
                  <dt className="text-[0.6875rem] tracking-[0.14em] text-ink-mute uppercase">
                    {fact.label}
                  </dt>
                  <dd className="mt-2 text-[1.0625rem] text-ink tnum">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </Section>

      <Section tone="paper">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-20">
            <div className="max-w-[68ch]">
              <Reveal>
                <p className="border-l-2 border-brass pl-5 text-[length:var(--text-lead)] leading-relaxed text-ink">
                  {page.intent}
                </p>
              </Reveal>

              {page.sections.map((section, i) => (
                <Reveal key={section.heading} delay={i * 40} className="mt-12">
                  <h2 className="text-[length:var(--text-h3)]">{section.heading}</h2>
                  <div className="mt-4 space-y-4 text-[length:var(--text-body-lg)] leading-relaxed text-ink-soft">
                    {section.body.map((para) => (
                      <p key={para.slice(0, 40)}>{para}</p>
                    ))}
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={60}>
              <div className="lg:sticky lg:top-28 lg:self-start">
                <div className="rounded-[var(--radius-card)] border border-line bg-paper-2 p-6">
                  <h2 className="text-[0.6875rem] tracking-[0.14em] text-ink-mute uppercase">
                    Rooms that suit this
                  </h2>
                  <ul className="mt-4 divide-y divide-line">
                    {page.recommendedRooms.map((slug) => {
                      const room = ROOMS_BY_SLUG[slug]
                      if (!room) return null
                      return (
                        <li key={slug}>
                          <Link
                            href={`/rooms/${slug}`}
                            className="group flex items-baseline justify-between gap-4 py-3.5"
                          >
                            <span className="min-w-0">
                              <span className="block text-[0.9375rem] text-ink">{room.name}</span>
                              <span className="mt-0.5 block text-[0.75rem] text-ink-mute">
                                Sleeps up to {room.occupancy.max}
                              </span>
                            </span>
                            <span className="shrink-0 text-[0.9375rem] text-brass-3 tnum dark:text-brass-2">
                              {formatINR(room.price)}
                            </span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>

                <nav aria-label="Related pages" className="mt-6 rounded-[var(--radius-card)] border border-line p-6">
                  <h2 className="text-[0.6875rem] tracking-[0.14em] text-ink-mute uppercase">
                    Also useful
                  </h2>
                  <ul className="mt-4 space-y-2.5">
                    {page.related.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="group inline-flex items-center gap-1.5 text-[0.875rem] text-ink-soft transition-colors hover:text-ink"
                        >
                          {link.label}
                          <ArrowUpRight className="size-3.5 text-brass transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      <Faqs
        items={faqs}
        eyebrow="Straight answers"
        heading="Questions about this"
        showAllLink
        tone="sand"
      />

      <ClosingCta />
    </>
  )
}
