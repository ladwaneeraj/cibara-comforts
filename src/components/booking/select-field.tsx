'use client'

import * as Popover from '@radix-ui/react-popover'
import { Check, ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export type SelectOption = {
  value: string
  label: string
  /** Right-aligned secondary text, such as a price. */
  hint?: string
}

/**
 * Styled select.
 *
 * A native `<select>` was the first implementation and it was the right
 * default: free accessibility, free localisation, and on a phone the OS
 * renders a proper full-width wheel or sheet. The problem is desktop. The
 * popup a native select opens is drawn by the operating system and cannot be
 * styled at all: system font, system blue highlight, square white panel. On a
 * site whose entire argument is that care has been taken, that one control
 * undoes the impression every time somebody opens it.
 *
 * So this is a listbox, built on the Radix Popover already in the bundle for
 * the calendar rather than on a second dependency. What it has to earn back,
 * because the native control gave it away for free:
 *
 *   - `role="listbox"` and `role="option"` with `aria-selected`, so it is
 *     announced as a select rather than as a menu of buttons.
 *   - Roving tabindex: one tab stop, arrows move within the list.
 *   - Home and End, Escape to dismiss, Enter or Space to choose.
 *   - Typeahead. Typing "3" jumps to "3 guests", exactly as a native select
 *     does, and the buffer clears after a second.
 *   - Focus returns to the trigger on close, which Radix handles.
 *
 * Lazy-loaded from the booking bar behind a statically rendered trigger of
 * identical markup, the same pattern as the date field, so it costs nothing
 * until somebody reaches for it and nothing shifts when it arrives.
 */
export function SelectField({
  label,
  icon: Icon,
  value,
  options,
  onChange,
  placeholder = 'Select',
  autoOpen = false,
  className,
}: {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  autoOpen?: boolean
  className?: string
}) {
  const uid = useId()
  const [open, setOpen] = useState(autoOpen)
  const [active, setActive] = useState(() => Math.max(0, options.findIndex((o) => o.value === value)))
  const listRef = useRef<HTMLDivElement>(null)
  const typed = useRef({ buffer: '', at: 0 })

  const selected = options.find((o) => o.value === value)

  const choose = useCallback(
    (index: number) => {
      const option = options[index]
      if (!option) return
      onChange(option.value)
      setOpen(false)
    },
    [onChange, options],
  )

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const last = options.length - 1
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        setActive((i) => (event.key === 'ArrowDown' ? Math.min(last, i + 1) : Math.max(0, i - 1)))
        return
      }
      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault()
        setActive(event.key === 'Home' ? 0 : last)
        return
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        choose(active)
        return
      }
      // Typeahead, matching native select behaviour.
      if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const now = Date.now()
        typed.current.buffer = now - typed.current.at > 1000 ? event.key : typed.current.buffer + event.key
        typed.current.at = now
        const match = options.findIndex((o) =>
          o.label.toLowerCase().startsWith(typed.current.buffer.toLowerCase()),
        )
        if (match >= 0) setActive(match)
      }
    },
    [active, choose, options],
  )

  // Move DOM focus with the active option so screen readers follow.
  useEffect(() => {
    if (!open) return
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.focus({ preventScroll: false })
  }, [active, open])

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next)
      if (next) setActive(Math.max(0, options.findIndex((o) => o.value === value)))
    },
    [options, value],
  )

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <SelectTrigger
          label={label}
          icon={Icon}
          display={selected?.label ?? placeholder}
          hint={selected?.hint}
          muted={!selected}
          expanded={open}
          controls={`${uid}-list`}
          className={className}
        />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className={cn(
            'z-50 max-h-[min(20rem,60vh)] w-[var(--radix-popover-trigger-width)] min-w-[13rem] overflow-y-auto',
            'rounded-[var(--radius-card)] border border-line bg-paper p-1.5 shadow-[var(--shadow-lift)] outline-none',
            'data-[state=open]:animate-[vt-in_180ms_var(--ease-out-soft)]',
          )}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.focus()
          }}
        >
          <div
            ref={listRef}
            role="listbox"
            id={`${uid}-list`}
            aria-label={label}
            onKeyDown={onKeyDown}
            className="flex flex-col"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  data-index={index}
                  tabIndex={index === active ? 0 : -1}
                  onClick={() => choose(index)}
                  onMouseEnter={() => setActive(index)}
                  className={cn(
                    'flex min-h-11 items-center justify-between gap-3 rounded-[0.625rem] px-3 py-2 text-left',
                    'text-[0.9375rem] transition-colors duration-150',
                    index === active ? 'bg-paper-2 text-ink' : 'text-ink-soft',
                    isSelected && 'font-medium text-ink',
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Check
                      aria-hidden
                      className={cn(
                        'size-3.5 shrink-0 text-brass transition-opacity',
                        isSelected ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span className="truncate">{option.label}</span>
                  </span>
                  {option.hint && (
                    <span className="shrink-0 text-[0.8125rem] text-ink-mute tnum">{option.hint}</span>
                  )}
                </button>
              )
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

/**
 * The visible face of the select.
 *
 * Exported so the booking bar can render an identical static copy before the
 * interactive one loads. Same reasoning as `DateTrigger`: an approximate
 * placeholder shifts the layout when it swaps, and a shift costs more than the
 * lazy loading saves.
 */
export function SelectTrigger({
  label,
  icon: Icon,
  display,
  hint,
  muted = false,
  expanded,
  controls,
  className,
  ...rest
}: {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  display: string
  hint?: string
  muted?: boolean
  expanded?: boolean
  controls?: string
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      role="combobox"
      // `combobox` takes its name from the author, not from its contents, so
      // the visible label and value inside the button do not count. Without
      // this the control is announced as an unnamed button.
      aria-label={`${label}, ${display}`}
      aria-haspopup="listbox"
      aria-expanded={expanded ?? false}
      aria-controls={expanded ? controls : undefined}
      className={cn(
        'relative flex w-full flex-col justify-center bg-paper px-4 py-2.5 text-left',
        'min-h-[3.5rem] transition-colors hover:bg-paper-2 sm:min-h-[3.75rem]',
        className,
      )}
      {...rest}
    >
      <span className="flex items-center gap-1.5 text-[0.625rem] font-medium tracking-[0.14em] text-ink-mute uppercase sm:text-[0.6875rem]">
        {Icon && <Icon className="size-3" />}
        {label}
      </span>
      <span className="mt-0.5 flex h-[1.4rem] items-center gap-2 overflow-hidden pr-5">
        <span
          className={cn(
            'truncate text-[0.9375rem]',
            muted ? 'text-ink-mute' : 'text-ink',
          )}
        >
          {display}
        </span>
        {hint && <span className="shrink-0 text-[0.8125rem] text-ink-mute tnum">{hint}</span>}
      </span>
      <ChevronDown
        aria-hidden
        className={cn(
          'pointer-events-none absolute right-3 bottom-3 size-4 text-ink-mute',
          'transition-transform duration-300 ease-[var(--ease-swift)]',
          expanded && 'rotate-180',
        )}
      />
    </button>
  )
}
