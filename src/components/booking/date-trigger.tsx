import { ArrowRight, CalendarDays } from 'lucide-react'
import { formatLong, formatShort, nightsBetween } from '@/lib/dates'
import { cn } from '@/lib/utils'

/**
 * The visible face of the date field.
 *
 * Deliberately a separate, dependency-free component so the exact same markup
 * can be rendered twice: once statically by the booking bar, at final size,
 * from first paint; and once by the lazily loaded calendar as its Popover
 * trigger. Because the two are identical, the moment the calendar chunk
 * arrives and takes over is invisible: no reflow, no CLS, no flash.
 *
 * The first attempt used an approximate grey skeleton and it cost 0.055 CLS,
 * which also reset the LCP measurement and made mobile a second slower than
 * shipping no lazy loading at all.
 */
export function DateTrigger({
  checkIn,
  checkOut,
  inert = false,
  className,
  ...rest
}: {
  checkIn: string
  checkOut: string
  /** Renders the static copy: no focus, no pointer events, hidden from AT. */
  inert?: boolean
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const nights = nightsBetween(checkIn, checkOut)

  const summary =
    nights > 0
      ? `${formatLong(checkIn)} to ${formatLong(checkOut)}, ${nights} night${nights > 1 ? 's' : ''}.`
      : 'No dates selected.'

  return (
    <button
      type="button"
      tabIndex={inert ? -1 : undefined}
      aria-hidden={inert || undefined}
      className={cn(
        'flex w-full items-center gap-3 bg-paper px-4 py-2.5 text-left',
        'min-h-[3.5rem] transition-colors sm:min-h-[3.75rem]',
        inert ? 'pointer-events-none' : 'hover:bg-paper-2',
        className,
      )}
      {...rest}
    >
      <CalendarDays className="size-4 shrink-0 text-brass" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block text-[0.625rem] font-medium tracking-[0.14em] text-ink-mute uppercase sm:text-[0.6875rem]">
          Your stay
        </span>
        {/* Fixed height and no wrapping, deliberately. The value goes from
            "Choose your dates" to a full range once the client knows what day
            it is, and letting that reflow the button grew the hero and cost
            0.127 CLS on a phone. Both states now occupy the same box. */}
        <span className="mt-0.5 flex h-[1.4rem] items-baseline gap-x-2 overflow-hidden text-[0.9375rem] whitespace-nowrap text-ink">
          {nights > 0 ? (
            <>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                {formatShort(checkIn)}
                <ArrowRight className="size-3 text-ink-mute" aria-hidden />
                {formatShort(checkOut)}
              </span>
              <span className="hidden text-[0.75rem] text-ink-mute tnum min-[380px]:inline">
                {nights} night{nights > 1 ? 's' : ''}
              </span>
            </>
          ) : (
            <span className="text-ink-mute">Choose your dates</span>
          )}
        </span>
      </span>
      {!inert && <span className="sr-only">. {summary} Opens a calendar.</span>}
    </button>
  )
}
