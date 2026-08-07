import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { TextReveal } from '@/components/motion/text-reveal'
import { cn } from '@/lib/utils'

export type Crumb = { name: string; path: string }

/**
 * Interior page header.
 *
 * Every page below the homepage opens the same way: breadcrumb, eyebrow,
 * display heading, lead. That repetition is the point. A visitor who lands on
 * a long-tail landing page from Google should recognise it as the same site
 * within one glance, and a consistent opening is what does that.
 *
 * Breadcrumbs are real links and are mirrored into BreadcrumbList JSON-LD by
 * the page that renders this, which is what produces the breadcrumb trail in
 * Google results instead of a bare URL.
 */
export function PageHeader({
  eyebrow,
  title,
  titleLines,
  lead,
  crumbs = [],
  children,
  className,
}: {
  eyebrow?: string
  /** Plain title. Use `titleLines` instead for the masked line reveal. */
  title?: string
  titleLines?: string[]
  lead?: ReactNode
  crumbs?: Crumb[]
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('border-b border-line bg-paper-2 pt-[7.5rem] pb-14 lg:pt-36 lg:pb-20', className)}>
      <div className="container-page">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-[0.75rem] text-ink-mute">
              {crumbs.map((crumb, i) => (
                <li key={crumb.path} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="size-3 opacity-50" aria-hidden />}
                  {i === crumbs.length - 1 ? (
                    <span aria-current="page" className="text-ink-soft">
                      {crumb.name}
                    </span>
                  ) : (
                    <Link href={crumb.path} className="transition-colors hover:text-ink">
                      {crumb.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {eyebrow && (
          <Reveal>
            <p className="eyebrow">
              <span aria-hidden className="h-px w-6 bg-current opacity-60" />
              {eyebrow}
            </p>
          </Reveal>
        )}

        {titleLines ? (
          <TextReveal
            lines={titleLines}
            as="h1"
            className="mt-5 max-w-4xl text-[length:var(--text-h1)]"
          />
        ) : (
          <Reveal delay={60}>
            <h1 className="mt-5 max-w-4xl text-[length:var(--text-h1)]">{title}</h1>
          </Reveal>
        )}

        {lead && (
          <Reveal delay={120}>
            <div className="mt-6 max-w-2xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
              {lead}
            </div>
          </Reveal>
        )}

        {children && (
          <Reveal delay={180} className="mt-9">
            {children}
          </Reveal>
        )}
      </div>
    </div>
  )
}
