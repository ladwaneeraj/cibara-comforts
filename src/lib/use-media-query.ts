'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * Subscribes to a CSS media query.
 *
 * `useSyncExternalStore` rather than `useState` plus `useEffect`. The effect
 * version calls setState synchronously on mount, which triggers a second
 * render pass for every component using it and is flagged by the React 19
 * lint rules. This reads the value during render on the client, returns the
 * server snapshot during SSR, and re-renders only when the query actually
 * changes, which also means it keeps working if the user rotates the device or
 * plugs in a mouse mid-session.
 *
 * `serverSnapshot` is the value assumed during server rendering and the first
 * client render. It should be the conservative answer: false for
 * "enhancement is available" queries, so the enhancement is added rather than
 * removed after hydration.
 */
export function useMediaQuery(query: string, serverSnapshot = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query],
  )

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverSnapshot,
  )
}

/** True when the visitor has a mouse or trackpad rather than only touch. */
export const FINE_POINTER = '(pointer: fine)'

/** True when the visitor has asked the OS to reduce animation. */
export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
