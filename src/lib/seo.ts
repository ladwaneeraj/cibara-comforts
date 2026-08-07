import type { Metadata } from 'next'
import { HOTEL, SITE_URL } from '@/content/hotel'

/**
 * Metadata factory.
 *
 * Every page builds its metadata through `pageMetadata` so that canonicals,
 * OpenGraph, Twitter cards and robots directives cannot drift apart. Title
 * templating lives in the root layout; pass the bare page title here.
 */

export const DEFAULT_OG = '/og/default.jpg'

type PageMetaInput = {
  title: string
  description: string
  /** Path with a leading slash, no trailing slash except for the root. */
  path: string
  /** Absolute or root-relative image path. Defaults to the property hero. */
  image?: string
  imageAlt?: string
  /** Set for guide articles so the OG type and article metadata are correct. */
  article?: { publishedTime: string; modifiedTime?: string; tags?: string[] }
  /** Thin or duplicate pages that should stay out of the index. */
  noIndex?: boolean
}

export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG,
  imageAlt,
  article,
  noIndex,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path)
  const ogImage = absoluteUrl(image)

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        'en-IN': url,
        'x-default': url,
      },
    },
    robots: noIndex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    openGraph: {
      type: article ? 'article' : 'website',
      url,
      siteName: HOTEL.name,
      title,
      description,
      locale: 'en_IN',
      images: [{ url: ogImage, width: 1200, height: 630, alt: imageAlt ?? title }],
      ...(article
        ? {
            publishedTime: article.publishedTime,
            modifiedTime: article.modifiedTime ?? article.publishedTime,
            tags: article.tags,
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

/**
 * Title suffix.
 *
 * Kept short because Google truncates around 60 characters and the property
 * name plus location is the part that must survive. Individual page titles are
 * written to fit inside the remaining budget.
 */
export const TITLE_TEMPLATE = `%s | ${HOTEL.name}, Harihar`
