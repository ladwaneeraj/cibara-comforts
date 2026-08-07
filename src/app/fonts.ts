import localFont from 'next/font/local'

/**
 * Typefaces, self-hosted from files committed to the repository.
 *
 * Deliberately `next/font/local` rather than `next/font/google`. The Google
 * loader fetches from fonts.googleapis.com during `next build`, which makes
 * every production build depend on a third-party network call. That is a
 * needless failure mode in CI, it is slow, and in restricted network
 * environments it fails outright. The files are 110 KB total, they change
 * roughly never, and committing them makes the build hermetic.
 *
 * Both are variable fonts subset to Latin, so one file covers every weight the
 * site uses. Regenerate with `npm run fonts` after bumping the @fontsource
 * dev dependencies.
 *
 * `size-adjust` and the fallback metrics below were measured against the
 * system fallbacks so that a swap between fallback and webfont produces no
 * reflow, which is what holds CLS at zero.
 */

export const fraunces = localFont({
  variable: '--font-fraunces',
  display: 'swap',
  // Not preloaded, unlike Inter. Fraunces is only used for headings, and
  // preloading both put 108 KB of webfont on the critical path competing with
  // the hero image on a 1.6 Mbps connection. With `swap` and a metric-matched
  // fallback the heading paints immediately in Georgia and swaps invisibly,
  // and CLS stays at zero. Inter stays preloaded because the LCP element on
  // the homepage is body text.
  preload: false,
  fallback: ['Iowan Old Style', 'Palatino Linotype', 'Georgia', 'serif'],
  adjustFontFallback: 'Times New Roman',
  // Roman only, and the wght-only subset rather than the one carrying the SOFT
  // axis: 35 KB instead of 60 KB, and nothing here varies SOFT so the rendered
  // result is identical. The italic face was dropped for the same reason.
  src: [{ path: '../fonts/fraunces-latin.woff2', weight: '100 900', style: 'normal' }],
})

export const inter = localFont({
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: [
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'sans-serif',
  ],
  adjustFontFallback: 'Arial',
  src: [{ path: '../fonts/inter-latin.woff2', weight: '100 900', style: 'normal' }],
})
