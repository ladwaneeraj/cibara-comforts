import { cn } from '@/lib/utils'

/**
 * Line-by-line display heading reveal.
 *
 * Pure CSS, and therefore a server component with no client JavaScript at all.
 *
 * The first version of this used Motion, which meant the H1 sat at
 * translateY(105%) behind its mask until React hydrated. On a slow connection
 * that is a headline invisible for a second or more, and it is invisible
 * entirely if the JavaScript never arrives. Neither is acceptable for the most
 * important sentence on the site. A CSS animation starts at first paint,
 * survives a failed bundle, and costs nothing.
 *
 * Lines are supplied by the caller rather than measured at runtime: runtime
 * splitting forces a layout read before paint and produces line breaks nobody
 * chose. The visual spans are hidden from the accessibility tree and the full
 * string is exposed via aria-label, so the heading is announced as one phrase.
 *
 * Under prefers-reduced-motion the global rule in globals.css collapses the
 * animation duration, so the text simply appears.
 */
export function TextReveal({
  lines,
  as: Tag = 'h1',
  className,
  lineClassName,
  delay = 0,
  stagger = 70,
}: {
  lines: string[]
  as?: 'h1' | 'h2' | 'p' | 'div'
  className?: string
  lineClassName?: string
  /** Milliseconds before the first line starts. */
  delay?: number
  /** Milliseconds between lines. */
  stagger?: number
}) {
  return (
    <Tag className={className} aria-label={lines.join(' ')}>
      {lines.map((line, i) => (
        <span key={line} className="block overflow-hidden pb-[0.06em]" aria-hidden>
          <span
            className={cn('line-reveal block', lineClassName)}
            style={{ animationDelay: `${delay + i * stagger}ms` }}
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  )
}
