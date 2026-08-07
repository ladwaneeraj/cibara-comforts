'use client'

import { useEffect } from 'react'

/**
 * Lenis smooth scrolling, desktop only.
 *
 * Deliberately not enabled on touch devices. Mobile browsers already have
 * tuned, GPU-composited momentum scrolling; replacing it with a JavaScript
 * rAF loop makes scrolling feel heavier, breaks pull-to-refresh and the
 * URL-bar collapse, and adds main-thread work on exactly the hardware that can
 * least afford it. Lenis on mobile is a common and expensive mistake.
 *
 * Also disabled under prefers-reduced-motion, where interpolated scrolling is
 * a vestibular trigger rather than a nicety.
 */
export function SmoothScroll() {
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduced) return

    // Dynamically imported so the library is never downloaded, parsed or
    // executed on a phone, which is where it is switched off anyway. Static
    // import put it in the main bundle for every visitor.
    let cleanup = () => {}
    let cancelled = false

    void import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return
      cleanup = attach(Lenis)
    })

    return () => {
      cancelled = true
      cleanup()
    }
  }, [])

  return null
}

type LenisCtor = typeof import('lenis').default

function attach(Lenis: LenisCtor) {
  {
    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      autoRaf: false,
    })

    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    // Keep in-page anchors working: Lenis owns the scroll position, so the
    // browser's native anchor jump would fight it.
    const onAnchorClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.('a[href^="#"]')
      if (!(anchor instanceof HTMLAnchorElement)) return
      const id = anchor.getAttribute('href')?.slice(1)
      if (!id) return
      const target = document.getElementById(id)
      if (!target) return
      event.preventDefault()
      lenis.scrollTo(target, { offset: -96 })
      history.replaceState(null, '', `#${id}`)
      // Move focus so keyboard and screen-reader users land where sighted
      // users do. Without this, smooth scroll silently breaks skip links.
      target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
    }

    document.addEventListener('click', onAnchorClick)
    return () => {
      document.removeEventListener('click', onAnchorClick)
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }
}
