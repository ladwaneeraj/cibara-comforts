import { Picture } from '@/components/media/picture'
import type { MediaId } from '@/content/generated/media'
import { GUIDE_MARKS, MARK_VIEWBOX, type GuideMarkId } from '@/content/guide-marks'
import { cn } from '@/lib/utils'

/**
 * Guide cover.
 *
 * Renders a drawn mark on the forest ground, or a real photograph if one has
 * been supplied. See content/guide-marks.ts for why these are drawn rather
 * than photographed or generated.
 *
 * The mark sits over a faint repeating grid, which gives the flat colour some
 * texture at large sizes without needing an image. The whole thing is inline
 * SVG in a server component, so it costs no requests and no JavaScript.
 *
 * To swap in a photograph later, set `photo` on the guide in content/guides.ts
 * and this component picks it up. Nothing else changes.
 */
export function GuideCover({
  mark,
  photo,
  photoAlt,
  ratio = '21 / 9',
  priority = false,
  className,
  compact = false,
}: {
  mark: GuideMarkId
  photo?: MediaId
  photoAlt?: string
  ratio?: string
  priority?: boolean
  className?: string
  /** Card-sized. Trims the padding and the corner rules. */
  compact?: boolean
}) {
  if (photo) {
    return (
      <Picture
        id={photo}
        alt={photoAlt ?? ''}
        sizes={compact ? '(min-width: 768px) 45vw, 100vw' : '100vw'}
        ratio={ratio}
        priority={priority}
        className={className}
      />
    )
  }

  const gridId = `grid-${mark}`

  return (
    <div
      style={{ aspectRatio: ratio }}
      className={cn(
        'relative isolate w-full overflow-hidden bg-forest text-brass-2 dark:bg-forest-2',
        className,
      )}
      role="img"
      aria-label={MARK_LABEL[mark]}
    >
      <svg aria-hidden className="absolute inset-0 h-full w-full opacity-[0.13]">
        <defs>
          <pattern id={gridId} width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0v28" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${gridId})`} />
      </svg>

      <svg
        aria-hidden
        viewBox={MARK_VIEWBOX}
        preserveAspectRatio="xMidYMid meet"
        className={cn('absolute inset-0 h-full w-full', compact ? 'p-5' : 'p-8 sm:p-12')}
        dangerouslySetInnerHTML={{ __html: GUIDE_MARKS[mark] }}
      />

      {!compact && (
        <>
          <span
            aria-hidden
            className="absolute top-6 left-6 h-8 w-8 border-t border-l border-current opacity-25"
          />
          <span
            aria-hidden
            className="absolute right-6 bottom-6 h-8 w-8 border-r border-b border-current opacity-25"
          />
        </>
      )}
    </div>
  )
}

/** Accessible description of each mark, for the role="img" wrapper. */
const MARK_LABEL: Record<GuideMarkId, string> = {
  temple: 'A line drawing of a Hoysala temple tower above a stepped star-plan base',
  road: 'A line drawing of a road curving past boulder fields, with a stop marked partway along',
  town: 'A line drawing of a river, ghat steps and the rooflines of a small town',
  transport: 'A line drawing of a railway line and a road meeting at a single point',
}
