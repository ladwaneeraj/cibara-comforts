import createMDX from '@next/mdx'
import type { NextConfig } from 'next'

/**
 * Next.js configuration for a static export to GitHub Pages.
 *
 * The deployment target has no Node runtime, which rules out Server Actions,
 * ISR, PPR, middleware, route handlers and the next/image optimizer. Those are
 * replaced as follows:
 *
 *   next/image optimizer -> scripts/optimize-images.mjs plus components/media/picture.tsx
 *   Server Actions       -> WhatsApp deep links (see lib/booking.ts)
 *   middleware headers   -> meta CSP here, plus Cloudflare rules (see docs/DEPLOYMENT.md)
 *   ISR                  -> not needed; content is a build-time constant
 *
 * If the site ever moves to Vercel or Cloudflare Workers, deleting `output`
 * and `images.unoptimized` is most of the migration.
 */
const withMDX = createMDX({
  options: { remarkPlugins: [], rehypePlugins: [] },
})

const nextConfig: NextConfig = {
  output: 'export',

  // GitHub Pages serves /about/ as /about/index.html. Without this, every
  // internal link would 404 on a hard refresh.
  trailingSlash: true,

  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],

  images: {
    // Not a capitulation: no optimizer exists at runtime on static hosting, and
    // the build-time pipeline produces better output than it would anyway.
    unoptimized: true,
  },

  // Fail the build on a type error or a lint error rather than shipping one.
  typescript: { ignoreBuildErrors: false },

  productionBrowserSourceMaps: false,

  experimental: {
    // Rewrites barrel imports from lucide-react into direct module paths,
    // which keeps tree shaking effective and cuts the client bundle.
    optimizePackageImports: ['lucide-react'],

    // NOTE: experimental.inlineCss was tried and reverted. It saves one
    // round trip but Next also copies the inlined CSS into the RSC flight
    // payload, so the homepage went from 48 KB to 87 KB gzipped and got
    // slower overall. The external stylesheet is also shared across routes.
    // Do not re-enable without measuring the transfer size.
  },
}

export default withMDX(nextConfig)
