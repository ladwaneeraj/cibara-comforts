'use client'

import * as Popover from '@radix-ui/react-popover'
import { Clock } from 'lucide-react'
import { useRef, useState } from 'react'
import { SelectTrigger } from '@/components/booking/select-field'
import { cn } from '@/lib/utils'

/**
 * Clock-face check-in time picker: tap or drag the dial for the hour, then the
 * minute, with an AM/PM toggle and typeable HH / MM above it.
 *
 * Why a dial and not a native <input type="time"> or a slot list: on the
 * desktop app the native picker is an unstyled OS dropdown and a 48-row list is
 * a lot of scrolling. A clock is what people expect for a time.
 *
 * Two things that are easy to get wrong and are deliberate here:
 *  - The selection disc is centred on the NUMBER ring (same radius as the
 *    digits) with the digit drawn on top, so the disc lands on the number it
 *    picks. A disc short of the ring is what makes a clock look broken.
 *  - All dialling lives in LOCAL draft state; the parent's onChange (which
 *    refetches availability) fires once, on close. That is why it doesn't lag.
 */

const CLOCK = 256
const C = CLOCK / 2 // centre
const R_NUM = 100 // digit ring radius — the disc rides this too
const SEL_R = 22 // selection disc radius

/** "HH:MM" (24h) → dial parts. */
export function parse24(hhmm: string): { h12: number; minute: number; pm: boolean } {
  const [h, m] = (hhmm || '13:00').split(':').map(Number)
  return { h12: h % 12 === 0 ? 12 : h % 12, minute: Number.isFinite(m) ? m : 0, pm: h >= 12 }
}

/** Dial parts → "HH:MM" (24h). */
export function to24(h12: number, minute: number, pm: boolean): string {
  const h = (h12 % 12) + (pm ? 12 : 0)
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

/** Screen angle (deg, 0 at top, clockwise) for a point relative to centre. */
function angleOf(dx: number, dy: number): number {
  const deg = (Math.atan2(dx, -dy) * 180) / Math.PI
  return deg < 0 ? deg + 360 : deg
}

/** Position of a mark `deg` clockwise from the top, at `radius`. */
function posAt(deg: number, radius: number) {
  const rad = (deg * Math.PI) / 180
  return { x: C + radius * Math.sin(rad), y: C - radius * Math.cos(rad) }
}

const to12 = (hhmm: string) => {
  const { h12, minute, pm } = parse24(hhmm)
  return `${h12}:${String(minute).padStart(2, '0')} ${pm ? 'PM' : 'AM'}`
}

export function ClockTimeField({
  value,
  min,
  onChange,
  label = 'Check-in time',
}: {
  value: string
  /** Same-day lower bound "HH:MM"; an earlier pick snaps up to it on close. */
  min?: string
  onChange: (value: string) => void
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(value)
  const [mode, setMode] = useState<'hours' | 'minutes'>('hours')
  const svgRef = useRef<SVGSVGElement>(null)

  const { h12, minute, pm } = parse24(draft)

  const commit = (next: boolean) => {
    setOpen(next)
    // Seed the draft from the committed value on open; push it up on close.
    if (next) {
      setDraft(value)
      setMode('hours')
    } else {
      onChange(min && draft < min ? min : draft)
    }
  }

  const setParts = (nh: number, nm: number, np: boolean) => setDraft(to24(nh, nm, np))

  const pointTo = (e: React.PointerEvent) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const deg = angleOf(((e.clientX - rect.left) / rect.width) * CLOCK - C, ((e.clientY - rect.top) / rect.height) * CLOCK - C)
    if (mode === 'hours') {
      setParts(Math.round(deg / 30) || 12, minute, pm)
    } else {
      // Snap the dial to clean 5-minute marks; typing allows any minute.
      setParts(h12, (Math.round(deg / 30) % 12) * 5, pm)
    }
  }

  const selDeg = mode === 'hours' ? h12 * 30 : minute * 6
  const sel = posAt(selDeg, R_NUM)
  const onMark = mode === 'hours' || minute % 5 === 0

  const marks =
    mode === 'hours'
      ? Array.from({ length: 12 }, (_, i) => ({ deg: (i + 1) * 30, text: i + 1, on: i + 1 === h12 }))
      : Array.from({ length: 12 }, (_, i) => ({ deg: i * 30, text: i * 5, on: i * 5 === minute }))

  const segInput =
    'w-[2ch] border-b-2 bg-transparent text-center caret-brass outline-none transition-colors selection:bg-paper-2 selection:text-ink'

  return (
    <Popover.Root open={open} onOpenChange={commit}>
      <Popover.Trigger asChild>
        <SelectTrigger label={label} icon={Clock} display={to12(value)} expanded={open} />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          collisionPadding={12}
          className={cn(
            'z-50 w-[18rem] rounded-[var(--radius-card)] border border-line bg-paper p-5',
            'shadow-[var(--shadow-lift)] outline-none',
            'data-[state=open]:animate-[vt-in_180ms_var(--ease-out-soft)]',
          )}
        >
          {/* Digital readout — the active segment is underlined; both typeable. */}
          <div className="flex items-center justify-center gap-2 text-[2rem] leading-none font-light tnum">
            <input
              aria-label="Hour"
              inputMode="numeric"
              value={h12}
              onFocus={() => setMode('hours')}
              onChange={(e) => {
                const n = Number(e.target.value.replace(/\D/g, '').slice(-2))
                if (n >= 1 && n <= 12) setParts(n, minute, pm)
              }}
              className={cn(segInput, mode === 'hours' ? 'border-brass text-brass' : 'border-transparent text-ink')}
            />
            <span className="-mt-0.5 text-ink-mute">:</span>
            <input
              aria-label="Minute"
              inputMode="numeric"
              value={String(minute).padStart(2, '0')}
              onFocus={() => setMode('minutes')}
              onChange={(e) => {
                const n = Number(e.target.value.replace(/\D/g, '').slice(-2))
                if (n >= 0 && n <= 59) setParts(h12, n, pm)
              }}
              className={cn(segInput, mode === 'minutes' ? 'border-brass text-brass' : 'border-transparent text-ink')}
            />
            {/* AM / PM — a clear segmented toggle, not stacked text. */}
            <div className="ml-1 flex flex-col overflow-hidden rounded-lg border border-line text-[0.75rem] font-semibold">
              {(['AM', 'PM'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setParts(h12, minute, m === 'PM')}
                  className={cn(
                    'px-2.5 py-1 transition-colors',
                    pm === (m === 'PM') ? 'bg-brass text-paper' : 'text-ink-mute hover:bg-paper-2',
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* The dial. Pointer capture so a press-drag keeps tracking. */}
          <svg
            ref={svgRef}
            viewBox={`0 0 ${CLOCK} ${CLOCK}`}
            className="mx-auto mt-4 block size-60 touch-none select-none"
            onPointerDown={(e) => {
              ;(e.target as Element).setPointerCapture?.(e.pointerId)
              pointTo(e)
            }}
            onPointerMove={(e) => {
              if (e.buttons === 1) pointTo(e)
            }}
            onPointerUp={() => mode === 'hours' && setMode('minutes')}
          >
            <circle cx={C} cy={C} r={122} className="fill-paper-2" />
            {/* Hand + selection disc, drawn under the digits. */}
            <line x1={C} y1={C} x2={sel.x} y2={sel.y} className="stroke-brass" strokeWidth={2.5} strokeLinecap="round" />
            <circle cx={sel.x} cy={sel.y} r={onMark ? SEL_R : 5} className="fill-brass" />
            <circle cx={C} cy={C} r={4} className="fill-brass" />
            {marks.map(({ deg, text, on }) => {
              const p = posAt(deg, R_NUM)
              return (
                <text
                  key={text}
                  x={p.x}
                  y={p.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={cn(
                    'pointer-events-none text-[1rem]',
                    on ? 'fill-paper font-semibold' : 'fill-ink-soft',
                  )}
                >
                  {mode === 'minutes' ? String(text).padStart(2, '0') : text}
                </text>
              )
            })}
          </svg>

          <button
            type="button"
            onClick={() => commit(false)}
            className="mt-4 w-full rounded-[0.625rem] bg-ink py-2.5 text-[0.875rem] font-medium text-paper transition-opacity hover:opacity-90"
          >
            Done
          </button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
