import type { MetadataRoute } from 'next'
import { GUIDES } from '@/content/guides'
import { SITE_URL } from '@/content/hotel'
import { LANDING_PAGES } from '@/content/landing-pages'
import { ROOMS } from '@/content/rooms'

/**
 * Sitemap.
 *
 * Generated from the same content files the pages are, so a new room or guide
 * appears here automatically and cannot be forgotten. The previous hand-written
 * sitemap.xml listed fragment URLs like `/#rooms`, which Google discards: a
 * fragment is not a separate document. Only real, indexable URLs are listed.
 *
 * `trailingSlash: true` is set in next.config.ts because GitHub Pages serves
 * directory indexes, so the canonical form of every URL here ends in a slash
 * except the root.
 */
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const url = (path: string) => `${SITE_URL}${path === '/' ? '/' : `${path}/`}`

  const staticPages: { path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' }[] = [
    { path: '/', priority: 1, changeFrequency: 'weekly' },
    { path: '/rooms', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/gallery', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/location', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/offers', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/corporate-stays', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/wedding-accommodation', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/faq', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/guides', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/contact', priority: 0.6, changeFrequency: 'yearly' },
    { path: '/policies', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
  ]

  return [
    ...staticPages.map((page) => ({
      url: url(page.path),
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...ROOMS.map((room) => ({
      url: url(`/rooms/${room.slug}`),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
    ...LANDING_PAGES.map((page) => ({
      url: url(`/${page.slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...GUIDES.map((guide) => ({
      url: url(`/guides/${guide.slug}`),
      lastModified: new Date(guide.updated ?? guide.published),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
  ]
}
