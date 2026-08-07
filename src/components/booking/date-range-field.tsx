'use client'

import * as Popover from '@radix-ui/react-popover'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DateTrigger } from '@/components/booking/date-trigger'
import {
  addDaysISO,
  compareISO,
  formatLong,
  formatMonth,
  formatShort,
  fromISO,
  monthGrid,
  nightsBetween,
  todayISO,
  WEEKDAY_LABELS,
  type CalendarCell,
} from '@/lib/dates'
import { cn } from '@/lib/utils'

/**
 * One field for the whole stay.
 *
 * Replaces the two native `<input type="date">` controls. Two separate date
 * boxes make the guest think about check-in and check-out as unrelated facts;
 * a single range field matches how people actually think about a stay ("two
 * nights from Friday") and shows the night count as they pick, which is the
 * number that determines the price.
 *
 * Built rather than installed. The accessible React date pickers worth using
 * cost 25 to 45 KB, and this is roughly 200 lines with no dependency beyond
 * the Radix Popover already in the bundle for focus management and outside
 * clicks. It is also lazy-loaded from the booking bar, so a visitor who never
 * touches the dates never downloads it.
 *
 * Accessibility, which is the part a hand-rolled picker usually gets wrong:
 *
 *   - `role="grid"` with real rows and gridcells, so screen readers announce
 *     it as a calendar rather than a pile of buttons.
 *   - Roaming tabindex: one stop for the whole grid, arrows move within it.
 *     Tabbing through 60 day buttons would be unusable.
 *   - Arrow keys move by day and week, PageUp/PageDown by month, Home and End
 *     to the ends of the week, all with the month following the focus.
 *   - Every day carries a full spoken date, plus its role in the range.
 *   - The trigger states the current selection in words, and changes are
 *     announced through a live region.
 *   - Nothing depends on hover: the range preview is a nicety, not a mechanism.
 */
export function DateRangeField({
  checkIn,
  checkOut,
  onChange,
  className,
  /**
   * Opens the moment the component mounts. Set when the booking bar mounted
   * this in response to a tap on its static trigger, so the guest's click is
   * not swallowed by the chunk arriving.
   */
  autoOpen = false,
  /** Latest date offered. Twelve months is well past any real booking window. */
  monthsAhead = 12,
}: {
  checkIn: string
  checkOut: string
  onChange: (range: { checkIn: string; checkOut: string }) => void
  className?: string
  autoOpen?: boolean
  monthsAhead?: number
}) {
  const today = todayISO()
  const [open, setOpen] = useState(autoOpen)
  /** Set while the guest has picked a check-in but not yet a check-out. */
  const [pendingStart, setPendingStart] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [focused, setFocused] = useState(checkIn || today)
  const gridRef = useRef<HTMLDivElement>(null)

  const lastDate = useMemo(() => addDaysISO(today, monthsAhead * 31), [today, monthsAhead])

  const focusedDate = fromISO(focused)
  const viewYear = focusedDate.getUTCFullYear()
  const viewMonth = focusedDate.getUTCMonth()

  // Two months side by side above 640px, one below. Rendering both and hiding
  // one in CSS keeps the keyboard model identical at every size.
  const months = [
    { year: viewYear, month: viewMonth },
    { year: viewMonth === 11 ? viewYear + 1 : viewYear, month: (viewMonth + 1) % 12 },
  ]

  const rangeStart = pendingStart ?? checkIn
  const rangeEnd = pendingStart ? (hovered && hovered > pendingStart ? hovered : null) : checkOut

  const isDisabled = useCallback(
    (iso: string) => compareISO(iso, today) < 0 || compareISO(iso, lastDate) > 0,
    [today, lastDate],
  )

  const select = useCallback(
    (iso: string) => {
      if (isDisabled(iso)) return

      // First tap sets check-in and clears the old range. Second tap sets
      // check-out, unless it is on or before check-in, in which case treat it
      // as the guest restarting from a new check-in.
      if (!pendingStart) {
        setPendingStart(iso)
        setHovered(null)
        return
      }
      if (compareISO(iso, pendingStart) <= 0) {
        setPendingStart(iso)
        return
      }
      onChange({ checkIn: pendingStart, checkOut: iso })
      setPendingStart(null)
      setHovered(null)
      setOpen(false)
    },
    [isDisabled, onChange, pendingStart],
  )

  const moveFocus = useCallback(
    (days: number) => {
      const next = addDaysISO(focused, days)
      if (compareISO(next, today) < 0 || compareISO(next, lastDate) > 0) return
      setFocused(next)
    },
    [focused, lastDate, today],
  )

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const moves: Record<string, number> = {
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -7,
        ArrowDown: 7,
      }
      if (event.key in moves) {
        event.preventDefault()
        moveFocus(moves[event.key])
        return
      }
      if (event.key === 'PageUp' || event.key === 'PageDown') {
        event.preventDefault()
        const d = fromISO(focused)
        d.setUTCMonth(d.getUTCMonth() + (event.key === 'PageDown' ? 1 : -1))
        const next = d.toISOString().slice(0, 10)
        setFocused(compareISO(next, today) < 0 ? today : next)
        return
      }
      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault()
        const weekday = (fromISO(focused).getUTCDay() + 6) % 7
        moveFocus(event.key === 'Home' ? -weekday : 6 - weekday)
        return
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        select(focused)
      }
    },
    [focused, moveFocus, select, today],
  )

  // Keep DOM focus on the focused day so screen readers follow the arrow keys.
  useEffect(() => {
    if (!open) return
    const node = gridRef.current?.querySelector<HTMLElement>(`[data-iso="${focused}"]`)
    node?.focus({ preventScroll: true })
  }, [focused, open])

  // Abandoning a half-finished selection must not leave the field half-selected
  // the next time it opens. Reset on the close event rather than in an effect
  // watching `open`, which would set state synchronously during render.
  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next)
      if (!next) {
        setPendingStart(null)
        setHovered(null)
      } else {
        setFocused(checkIn || today)
      }
    },
    [checkIn, today],
  )

  const nights = nightsBetween(checkIn, checkOut)

  const summary = pendingStart
    ? `${formatLong(pendingStart)} selected. Now choose your check-out date.`
    : nights > 0
      ? `${formatLong(checkIn)} to ${formatLong(checkOut)}, ${nights} night${nights > 1 ? 's' : ''}.`
      : 'No dates selected.'

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <DateTrigger checkIn={checkIn} checkOut={checkOut} className={className} />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={10}
          collisionPadding={12}
          className={cn(
            'z-50 w-[min(41rem,calc(100vw-1.5rem))] rounded-[var(--radius-panel)] border border-line',
            'bg-paper p-4 shadow-[var(--shadow-lift)] outline-none sm:p-5',
            'data-[state=open]:animate-[vt-in_220ms_var(--ease-out-soft)]',
          )}
          onOpenAutoFocus={(event) => {
            // Focus the grid rather than the first day, so the roaming
            // tabindex takes over immediately.
            event.preventDefault()
            gridRef.current?.querySelector<HTMLElement>(`[data-iso="${focused}"]`)?.focus()
          }}
        >
          <div className="flex items-center justify-between gap-3 pb-3">
            <NavButton
              label="Previous month"
              disabled={viewYear === fromISO(today).getUTCFullYear() && viewMonth === fromISO(today).getUTCMonth()}
              onClick={() => {
                const d = fromISO(focused)
                d.setUTCMonth(d.getUTCMonth() - 1)
                const next = d.toISOString().slice(0, 10)
                setFocused(compareISO(next, today) < 0 ? today : next)
              }}
            >
              <ChevronLeft className="size-4" aria-hidden />
            </NavButton>

            <p aria-live="polite" className="text-[0.8125rem] text-ink-mute">
              {pendingStart ? 'Now pick your check-out' : 'Pick your check-in'}
            </p>

            <NavButton
              label="Next month"
              onClick={() => {
                const d = fromISO(focused)
                d.setUTCMonth(d.getUTCMonth() + 1)
                setFocused(d.toISOString().slice(0, 10))
              }}
            >
              <ChevronRight className="size-4" aria-hidden />
            </NavButton>
          </div>

          <div
            ref={gridRef}
            onKeyDown={onKeyDown}
            onMouseLeave={() => setHovered(null)}
            className="grid gap-6 sm:grid-cols-2"
          >
            {months.map((m, index) => (
              <Month
                key={`${m.year}-${m.month}`}
                year={m.year}
                month={m.month}
                className={index === 1 ? 'hidden sm:block' : undefined}
                focused={focused}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                checkIn={checkIn}
                checkOut={checkOut}
                pendingStart={pendingStart}
                isDisabled={isDisabled}
                onSelect={select}
                onHover={setHovered}
              />
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3.5">
            <p className="text-[0.8125rem] text-ink-mute">
              <span className="sr-only" aria-live="polite">
                {summary}
              </span>
              <span aria-hidden>
                {nights > 0 && !pendingStart
                  ? `${formatShort(checkIn)} to ${formatShort(checkOut)} · ${nights} night${nights > 1 ? 's' : ''}`
                  : 'Free cancellation until 24 hours before'}
              </span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const next = todayISO()
                  onChange({ checkIn: next, checkOut: addDaysISO(next, 1) })
                  setPendingStart(null)
                  setFocused(next)
                }}
                className="rounded-full border border-line px-3.5 py-1.5 text-[0.8125rem] text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
              >
                Tonight
              </button>
              <Popover.Close className="rounded-full bg-ink px-4 py-1.5 text-[0.8125rem] font-medium text-paper transition-colors hover:bg-forest">
                Done
              </Popover.Close>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function NavButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-9 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-paper-2 hover:text-ink disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  )
}

function Month({
  year,
  month,
  className,
  focused,
  rangeStart,
  rangeEnd,
  checkIn,
  checkOut,
  pendingStart,
  isDisabled,
  onSelect,
  onHover,
}: {
  year: number
  month: number
  className?: string
  focused: string
  rangeStart: string
  rangeEnd: string | null
  checkIn: string
  checkOut: string
  pendingStart: string | null
  isDisabled: (iso: string) => boolean
  onSelect: (iso: string) => void
  onHover: (iso: string | null) => void
}) {
  const cells = monthGrid(year, month)
  const rows: CalendarCell[][] = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))

  const label = formatMonth(year, month)

  return (
    <section className={className} aria-label={label}>
      <h3 className="pb-3 text-center font-display text-[1.0625rem] text-ink">{label}</h3>
      <div role="grid" aria-label={label} className="w-full">
        <div role="row" className="grid grid-cols-7">
          {WEEKDAY_LABELS.map((day) => (
            <div
              key={day}
              role="columnheader"
              aria-label={day}
              className="pb-2 text-center text-[0.625rem] font-medium tracking-[0.08em] text-ink-mute uppercase"
            >
              {day.slice(0, 2)}
            </div>
          ))}
        </div>

        {rows.map((row, rowIndex) => (
          <div role="row" key={rowIndex} className="grid grid-cols-7">
            {row.map((cell, cellIndex) => {
              if (!cell) return <div role="gridcell" key={cellIndex} aria-hidden />

              const { iso, day } = cell
              const disabled = isDisabled(iso)
              const isStart = iso === rangeStart
              const isEnd = rangeEnd !== null && iso === rangeEnd
              const inRange =
                rangeEnd !== null && iso > rangeStart && iso < rangeEnd
              const selected = isStart || isEnd
              const isCheckIn = !pendingStart && iso === checkIn
              const isCheckOut = !pendingStart && iso === checkOut

              const role = isCheckIn
                ? ', check-in'
                : isCheckOut
                  ? ', check-out'
                  : inRange
                    ? ', within your stay'
                    : ''

              return (
                <div role="gridcell" key={iso} aria-selected={selected} className="relative">
                  {/* The connecting bar sits behind the day so a continuous
                      range reads as one shape rather than seven circles. */}
                  {(inRange || (isStart && rangeEnd) || (isEnd && rangeStart)) && (
                    <span
                      aria-hidden
                      className={cn(
                        'absolute inset-y-1 bg-brass/20 dark:bg-brass/25',
                        inRange && 'inset-x-0',
                        isStart && rangeEnd && 'right-0 left-1/2',
                        isEnd && 'right-1/2 left-0',
                      )}
                    />
                  )}
                  <button
                    type="button"
                    data-iso={iso}
                    tabIndex={iso === focused ? 0 : -1}
                    disabled={disabled}
                    aria-label={`${formatLong(iso)}${role}`}
                    aria-current={iso === focused ? 'date' : undefined}
                    onClick={() => onSelect(iso)}
                    onMouseEnter={() => onHover(iso)}
                    className={cn(
                      'relative grid h-10 w-full place-items-center rounded-full text-[0.875rem] tnum',
                      'transition-colors duration-150',
                      disabled && 'cursor-not-allowed text-ink-mute/35',
                      !disabled && !selected && 'text-ink-soft hover:bg-paper-3',
                      selected && 'bg-ink font-medium text-paper hover:bg-forest',
                    )}
                  >
                    {day}
                  </button>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}
