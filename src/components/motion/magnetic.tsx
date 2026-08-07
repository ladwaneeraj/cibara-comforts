'use client'

import { type ReactNode, useCallback, useRef } from 'react'
import { FINE_POINTER, REDUCED_MOTION, useMediaQuery } from '@/lib/use-media-query'
import { cn } from '@/lib/utils'

/**
 * Magnetic hover.
 *
 * The element drifts a few pixels toward the cursor while it is nearby, then
 * springs back on leave.
 *
 * Written against two CSS custom properties and a pointermove handler rather
 * than a spring library. The library version was the first implementation and
 * it cost roughly 35 KB of JavaScript, shipped to every visitor, to produce an
 * eight pixel translation that only pointer users ever see. That is a bad
 * trade on a site whose guests are mostly on budget Android phones. This
 * version is about thirty lines, writes to a compositor-only property, and
 * adds nothing to the bundle.
 *
 * Gated behind `(pointer: fine)` and disabled entirely under reduced motion,
 * where a control that moves away from the cursor is an accessibility problem
 * rather than a delight. Displacement is capped at 8px: larger stops reading
 * as responsiveness and starts reading as a bug.
 */
export function Magnetic({
  children,
  strength = 0.28,
  max = 8,
  className,
}: {
  children: ReactNode
  strength?: number
  max?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const finePointer = useMediaQuery(FINE_POINTER)
  const reducedMotion = useMediaQuery(REDUCED_MOTION)
  const enabled = finePointer && !reducedMotion

  const onMove = useCallback(
    (event: React.PointerEvent) => {
      const node = ref.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const dx = (event.clientX - (rect.left + rect.width / 2)) * strength
      const dy = (event.clientY - (rect.top + rect.height / 2)) * strength
      node.style.setProperty('--mx', `${Math.max(-max, Math.min(max, dx))}px`)
      node.style.setProperty('--my', `${Math.max(-max, Math.min(max, dy))}px`)
    },
    [max, strength],
  )

  const reset = useCallback(() => {
    const node = ref.current
    if (!node) return
    node.style.setProperty('--mx', '0px')
    node.style.setProperty('--my', '0px')
  }, [])

  if (!enabled) return <span className={className}>{children}</span>

  return (
    <span
      ref={ref}
      className={cn('magnetic', className)}
      onPointerMove={onMove}
      onPointerLeave={reset}
      onBlur={reset}
    >
      {children}
    </span>
  )
}
