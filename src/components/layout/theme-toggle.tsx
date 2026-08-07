'use client'

import { Moon, Sun } from 'lucide-react'
import { useCallback, useSyncExternalStore } from 'react'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'cibara-theme'

/**
 * Light and dark toggle.
 *
 * The dark palette is not an inverted light palette. It is the property at
 * night: the forest green that is on the walls, warm brass lamplight, cream
 * linen. That is the only reason dark mode is here at all. A generic grey dark
 * theme would have been a maintenance cost with no brand return.
 *
 * The initial class is written by the blocking script in layout.tsx before
 * first paint, so there is no flash. This component only handles the toggle
 * and persistence afterwards.
 *
 * State is read from the DOM through `useSyncExternalStore` and a
 * MutationObserver rather than mirrored into React state. The DOM class is the
 * source of truth (the blocking script sets it before React exists), and
 * mirroring it with useState plus useEffect would mean a second render on
 * every mount and a chance of the two drifting apart.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

export function ThemeToggle({ className }: { className?: string }) {
  const dark = useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains('dark'),
    // During SSR and the first client render nothing is known, so the label
    // stays generic until the DOM has been read.
    () => null,
  )

  const toggle = useCallback(() => {
    const next = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light')
    } catch {
      // Private browsing. The toggle still works for this session.
    }
  }, [])

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark === null ? 'Switch theme' : `Switch to ${dark ? 'light' : 'dark'} theme`}
      aria-pressed={dark ?? undefined}
      className={cn(
        'grid size-10 place-items-center rounded-full transition-colors',
        'hover:bg-current/10',
        className,
      )}
    >
      {/* Both icons render; CSS picks one. Avoids a hydration mismatch and a
          layout shift on the first paint. */}
      <Sun className="size-[1.15rem] dark:hidden" aria-hidden />
      <Moon className="hidden size-[1.15rem] dark:block" aria-hidden />
    </button>
  )
}

/**
 * Blocking theme script.
 *
 * Runs before paint. Kept as a string rather than a file so it is inlined and
 * cannot be delayed by a network round trip, which is the whole point.
 */
export const THEME_SCRIPT = `(function(){try{var s=localStorage.getItem('${STORAGE_KEY}');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(!s&&m)){document.documentElement.classList.add('dark')}}catch(e){}})()`
