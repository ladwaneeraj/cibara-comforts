import type { ElementType, ReactNode } from 'react'
import { Reveal } from '@/components/motion/reveal'
import { cn } from '@/lib/utils'

/**
 * Section shell.
 *
 * Vertical rhythm comes from one token (`--spacing-section`) so that every
 * section on the site breathes identically. Consistent rhythm is most of what
 * reads as "expensive layout"; inconsistent rhythm is most of what reads as
 * "template".
 */
export function Section({
  children,
  id,
  className,
  tone = 'paper',
  as: Tag = 'section',
  labelledBy,
}: {
  children: ReactNode
  id?: string
  className?: string
  tone?: 'paper' | 'sand' | 'forest' | 'none'
  as?: ElementType
  labelledBy?: string
}) {
  return (
    <Tag
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        'py-[var(--spacing-section)]',
        tone === 'paper' && 'bg-paper',
        tone === 'sand' && 'bg-paper-2',
        tone === 'forest' && 'bg-forest text-paper-2 dark:bg-forest-2',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

/**
 * Section heading block.
 *
 * The eyebrow, heading and lead are one component because their relative
 * spacing and measure are a design decision, not a per-section choice. Letting
 * each section set its own would guarantee drift.
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  id,
  align = 'left',
  onDark = false,
  className,
  children,
}: {
  eyebrow?: string
  title: ReactNode
  lead?: ReactNode
  id?: string
  align?: 'left' | 'center'
  onDark?: boolean
  className?: string
  children?: ReactNode
}) {
  return (
    <Reveal
      className={cn(
        'max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && (
        <p className={cn('eyebrow', onDark && 'text-brass-2')}>
          <span aria-hidden className="h-px w-6 bg-current opacity-60" />
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className={cn('mt-4 text-[length:var(--text-h2)]', onDark && 'text-paper')}
      >
        {title}
      </h2>
      {lead && (
        <p
          className={cn(
            'mt-5 text-[length:var(--text-lead)] leading-relaxed text-ink-soft',
            onDark && 'text-paper-3/85',
            align === 'center' && 'mx-auto',
          )}
        >
          {lead}
        </p>
      )}
      {children}
    </Reveal>
  )
}
