import { Fragment } from 'react'
import { cn } from '@/lib/utils'

/**
 * Long-form body renderer.
 *
 * Guides are authored as one template string per article in
 * content/guides.ts, using a deliberately tiny Markdown subset:
 *
 *   ## Heading            -> h2
 *   ### Heading           -> h3
 *   - item                -> unordered list
 *   1. item               -> ordered list
 *   > quote               -> pull quote
 *   ![id](alt)            -> an image from the media manifest
 *   ---                   -> a fading rule
 *   anything else         -> paragraph
 *
 * Inline: **bold**, *italic*, [text](/path) and `code`.
 *
 * Why not MDX. MDX would mean either a second registry file per article to
 * feed the index page, or a frontmatter parser, plus a loader in the build.
 * For a handful of guides written by one person, a typed string in a typed
 * file gives a single source of truth, full type safety, no build plugins and
 * no dependency to keep current. If the guide count ever reaches a point where
 * a CMS makes sense, this renderer is the thing that gets replaced, and
 * nothing else has to change. See docs/ARCHITECTURE.md.
 */

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\)|`[^`]+`)/g

function renderInline(text: string, keyPrefix: string) {
  return text.split(INLINE).map((chunk, i) => {
    const key = `${keyPrefix}-${i}`
    if (chunk.startsWith('**') && chunk.endsWith('**')) {
      return (
        <strong key={key} className="font-medium text-ink">
          {chunk.slice(2, -2)}
        </strong>
      )
    }
    if (chunk.startsWith('*') && chunk.endsWith('*') && chunk.length > 2) {
      return <em key={key}>{chunk.slice(1, -1)}</em>
    }
    if (chunk.startsWith('`') && chunk.endsWith('`')) {
      return (
        <code key={key} className="rounded bg-paper-3 px-1.5 py-0.5 text-[0.9em]">
          {chunk.slice(1, -1)}
        </code>
      )
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(chunk)
    if (link) {
      const [, label, href] = link
      const external = href.startsWith('http')
      return (
        <a
          key={key}
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="font-medium text-ink underline decoration-brass decoration-2 underline-offset-4 transition-colors hover:decoration-ink"
        >
          {label}
        </a>
      )
    }
    return <Fragment key={key}>{chunk}</Fragment>
  })
}

type Block =
  | { kind: 'h2' | 'h3' | 'p' | 'quote'; text: string }
  | { kind: 'ul' | 'ol'; items: string[] }
  | { kind: 'rule' }

function parse(source: string): Block[] {
  const blocks: Block[] = []
  const chunks = source
    .trim()
    .split(/\n\s*\n/)
    .map((c) => c.trim())
    .filter(Boolean)

  for (const chunk of chunks) {
    const lines = chunk.split('\n').map((l) => l.trim())

    if (lines.every((l) => l.startsWith('- '))) {
      blocks.push({ kind: 'ul', items: lines.map((l) => l.slice(2)) })
      continue
    }
    if (lines.every((l) => /^\d+\.\s/.test(l))) {
      blocks.push({ kind: 'ol', items: lines.map((l) => l.replace(/^\d+\.\s/, '')) })
      continue
    }

    const text = lines.join(' ')
    if (text === '---') blocks.push({ kind: 'rule' })
    else if (text.startsWith('### ')) blocks.push({ kind: 'h3', text: text.slice(4) })
    else if (text.startsWith('## ')) blocks.push({ kind: 'h2', text: text.slice(3) })
    else if (text.startsWith('> ')) blocks.push({ kind: 'quote', text: text.slice(2) })
    else blocks.push({ kind: 'p', text })
  }

  return blocks
}

/** Turns a heading into a stable anchor id for the table of contents. */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

/** Extracts the h2 headings, for a table of contents. */
export function outline(source: string): { text: string; id: string }[] {
  const headings: { text: string; id: string }[] = []
  for (const block of parse(source)) {
    if ('text' in block && block.kind === 'h2') {
      headings.push({ text: block.text, id: slugifyHeading(block.text) })
    }
  }
  return headings
}

export function Prose({ source, className }: { source: string; className?: string }) {
  const blocks = parse(source)

  return (
    <div className={cn('max-w-[68ch] text-[length:var(--text-body-lg)] leading-relaxed', className)}>
      {blocks.map((block, i) => {
        const key = `b${i}`
        switch (block.kind) {
          case 'h2':
            return (
              <h2
                key={key}
                id={slugifyHeading(block.text)}
                className="mt-14 scroll-mt-28 text-[length:var(--text-h2)] first:mt-0"
              >
                {block.text}
              </h2>
            )
          case 'h3':
            return (
              <h3 key={key} className="mt-10 scroll-mt-28 text-[length:var(--text-h3)]">
                {block.text}
              </h3>
            )
          case 'quote':
            return (
              <blockquote
                key={key}
                className="my-10 border-l-2 border-brass pl-6 font-display text-[clamp(1.25rem,1.05rem+0.9vw,1.75rem)] leading-snug text-ink"
              >
                {renderInline(block.text, key)}
              </blockquote>
            )
          case 'rule':
            return <hr key={key} className="rule-fade my-12 border-0" />
          case 'ul':
            return (
              <ul key={key} className="mt-5 space-y-2.5">
                {block.items.map((item, n) => (
                  <li key={item.slice(0, 30)} className="flex gap-3 text-ink-soft">
                    <span aria-hidden className="mt-[0.7em] size-1 shrink-0 rounded-full bg-brass" />
                    <span>{renderInline(item, `${key}-${n}`)}</span>
                  </li>
                ))}
              </ul>
            )
          case 'ol':
            return (
              <ol key={key} className="mt-5 space-y-3">
                {block.items.map((item, n) => (
                  <li key={item.slice(0, 30)} className="flex gap-4 text-ink-soft">
                    <span
                      aria-hidden
                      className="mt-1 grid size-6 shrink-0 place-items-center rounded-full border border-line text-[0.6875rem] text-ink-mute tnum"
                    >
                      {n + 1}
                    </span>
                    <span>{renderInline(item, `${key}-${n}`)}</span>
                  </li>
                ))}
              </ol>
            )
          default:
            return (
              <p key={key} className="mt-5 text-ink-soft">
                {renderInline(block.text, key)}
              </p>
            )
        }
      })}
    </div>
  )
}
