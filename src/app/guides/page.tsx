import { ArrowUpRight, Clock } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/layout/page-header'
import { Picture } from '@/components/media/picture'
import { Reveal } from '@/components/motion/reveal'
import { ClosingCta } from '@/components/sections/closing-cta'
import { Section } from '@/components/ui/section'
import { GUIDES } from '@/content/guides'
import { breadcrumbNode, jsonLdGraph } from '@/lib/schema'
import { absoluteUrl, pageMetadata } from '@/lib/seo'

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Guides', path: '/guides' },
]

export const metadata: Metadata = pageMetadata({
  title: 'Travel Guides to Harihar and Around',
  description:
    'Practical guides to Harihar and northern Karnataka: driving Bengaluru to Hampi, Harihareshwara Temple, and how to reach Harihar by train, bus or road.',
  path: '/guides',
  image: '/og/location.jpg',
})

export default function GuidesIndexPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdGraph(breadcrumbNode(CRUMBS), {
            '@type': 'CollectionPage',
            name: 'Travel guides to Harihar and around',
            hasPart: GUIDES.map((g) => ({
              '@type': 'Article',
              headline: g.title,
              url: absoluteUrl(`/guides/${g.slug}`),
              datePublished: g.published,
            })),
          }),
        }}
      />

      <PageHeader
        crumbs={CRUMBS}
        eyebrow={`${GUIDES.length} guides`}
        titleLines={['Written by people', 'who live here']}
        lead="Practical guides to Harihar and the roads out of it. No affiliate links, no padding, and where somewhere else is the better answer we say so."
      />

      <Section tone="paper">
        <div className="container-page">
          <ul className="grid gap-8 md:grid-cols-2">
            {GUIDES.map((guide, i) => (
              <Reveal as="li" key={guide.slug} delay={i * 70}>
                <article className="group h-full">
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper transition-all duration-500 ease-[var(--ease-swift)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
                  >
                    <Picture
                      id={guide.image}
                      alt={guide.imageAlt}
                      sizes="(min-width: 768px) 45vw, 100vw"
                      ratio="16 / 9"
                      className="transition-transform duration-[1100ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
                    />
                    <div className="flex flex-1 flex-col p-7">
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] tracking-[0.14em] text-ink-mute uppercase">
                        {guide.tags[0]}
                        <span aria-hidden className="size-1 rounded-full bg-line-strong" />
                        <span className="inline-flex items-center gap-1 normal-case tracking-normal">
                          <Clock className="size-3" aria-hidden />
                          {guide.readingMinutes} min read
                        </span>
                      </p>
                      <h2 className="mt-4 text-[length:var(--text-h3)]">{guide.title}</h2>
                      <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink-soft">
                        {guide.standfirst}
                      </p>
                      <p className="mt-6 inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-ink">
                        Read the guide
                        <ArrowUpRight className="size-3.5 text-brass transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </p>
                    </div>
                  </Link>
                </article>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      <ClosingCta />
    </>
  )
}
