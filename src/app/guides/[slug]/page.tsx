import { ArrowUpRight, Clock } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { WhatsAppAction } from '@/components/booking/actions'
import { PageHeader } from '@/components/layout/page-header'
import { Picture } from '@/components/media/picture'
import { Reveal } from '@/components/motion/reveal'
import { Section } from '@/components/ui/section'
import { outline, Prose } from '@/components/ui/prose'
import { GUIDES, GUIDES_BY_SLUG } from '@/content/guides'
import { HOTEL } from '@/content/hotel'
import { formatINR, LOWEST_RATE } from '@/content/rooms'
import { articleNode, breadcrumbNode, jsonLdGraph } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const guide = GUIDES_BY_SLUG[slug]
  if (!guide) return {}

  return {
    ...pageMetadata({
      title: guide.seoTitle,
      description: guide.metaDescription,
      path: `/guides/${guide.slug}`,
      image: `/media/${guide.image}/fallback.jpg`,
      imageAlt: guide.imageAlt,
      article: {
        publishedTime: guide.published,
        modifiedTime: guide.updated ?? guide.published,
        tags: guide.tags,
      },
    }),
    title: { absolute: guide.seoTitle },
  }
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params
  const guide = GUIDES_BY_SLUG[slug]
  if (!guide) notFound()

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/guides' },
    { name: guide.tags[0], path: `/guides/${guide.slug}` },
  ]

  const toc = outline(guide.body)
  const others = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 3)

  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(guide.published))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdGraph(
            breadcrumbNode(crumbs),
            articleNode({
              headline: guide.title,
              description: guide.metaDescription,
              path: `/guides/${guide.slug}`,
              published: guide.published,
              modified: guide.updated,
              image: `/media/${guide.image}/fallback.jpg`,
            }),
          ),
        }}
      />

      <PageHeader
        crumbs={crumbs}
        eyebrow={`${guide.tags.join(' · ')}`}
        titleLines={guide.headingLines}
        lead={guide.standfirst}
      >
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8125rem] text-ink-mute">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" aria-hidden />
            {guide.readingMinutes} minute read
          </span>
          <span aria-hidden className="size-1 rounded-full bg-line-strong" />
          <span>
            Published {formattedDate} by {HOTEL.name}
          </span>
        </p>
      </PageHeader>

      <Section tone="paper" className="!pb-0">
        <div className="container-page">
          <Reveal>
            <Picture
              id={guide.image}
              alt={guide.imageAlt}
              sizes="100vw"
              ratio="21 / 9"
              priority
              className="rounded-[var(--radius-card)]"
            />
          </Reveal>
        </div>
      </Section>

      <Section tone="paper">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16">
            <article>
              <Prose source={guide.body} />
            </article>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              {toc.length > 1 && (
                <nav aria-label="On this page" className="hidden lg:block">
                  <h2 className="text-[0.6875rem] tracking-[0.14em] text-ink-mute uppercase">
                    On this page
                  </h2>
                  <ol className="mt-4 space-y-2.5 border-l border-line">
                    {toc.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="-ml-px block border-l border-transparent pl-4 text-[0.8125rem] leading-snug text-ink-mute transition-colors hover:border-brass hover:text-ink"
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              <div className="mt-10 rounded-[var(--radius-card)] border border-line bg-paper-2 p-6">
                <p className="font-display text-[1.25rem] text-ink">Staying in Harihar?</p>
                <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-mute">
                  We are 800 metres from the railway station. Rooms from {formatINR(LOWEST_RATE)},
                  nothing charged until you arrive.
                </p>
                <WhatsAppAction
                  source={`guide_${guide.slug}`}
                  size="sm"
                  className="mt-5 w-full"
                >
                  Ask about a room
                </WhatsAppAction>
                <Link
                  href="/rooms"
                  className="mt-3 block text-center text-[0.8125rem] text-ink-soft underline decoration-brass underline-offset-4"
                >
                  See all five rooms
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </Section>

      <Section tone="sand" labelledBy="more-guides">
        <div className="container-page">
          <h2 id="more-guides" className="text-[length:var(--text-h2)]">
            More from around here
          </h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {others.map((other, i) => (
              <Reveal as="li" key={other.slug} delay={i * 70}>
                <Link
                  href={`/guides/${other.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
                >
                  <Picture
                    id={other.image}
                    alt={other.imageAlt}
                    sizes="(min-width: 768px) 30vw, 100vw"
                    ratio="16 / 9"
                    className="transition-transform duration-[1100ms] group-hover:scale-[1.04]"
                  />
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-[1.0625rem] font-display leading-snug text-ink">
                      {other.title}
                    </h3>
                    <p className="mt-4 inline-flex items-center gap-1.5 text-[0.75rem] text-ink-mute">
                      {other.readingMinutes} min read
                      <ArrowUpRight className="size-3 text-brass" aria-hidden />
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>
    </>
  )
}
