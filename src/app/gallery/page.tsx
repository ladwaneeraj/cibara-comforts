import type { Metadata } from 'next'
import { GalleryGrid } from '@/components/gallery/gallery-grid'
import { PageHeader } from '@/components/layout/page-header'
import { ClosingCta } from '@/components/sections/closing-cta'
import { Section } from '@/components/ui/section'
import { GALLERY } from '@/content/gallery'
import { HOTEL, SITE_URL } from '@/content/hotel'
import { breadcrumbNode, jsonLdGraph } from '@/lib/schema'
import { absoluteUrl, pageMetadata } from '@/lib/seo'

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Gallery', path: '/gallery' },
]

export const metadata: Metadata = pageMetadata({
  title: 'Photographs',
  description: `Real photographs of every room, bathroom and detail at ${HOTEL.name} in Harihar. No stock imagery and no wide-angle tricks.`,
  path: '/gallery',
  image: '/og/gallery.jpg',
})

/**
 * ImageGallery structured data.
 *
 * Gives Google Images a labelled set with captions, which is a meaningful
 * traffic source for hotels: a large share of "hotels in <town>" browsing
 * happens through the image tab and the Maps photo carousel.
 */
function galleryNode() {
  return {
    '@type': 'ImageGallery',
    '@id': `${SITE_URL}/gallery/#gallery`,
    name: `Photographs of ${HOTEL.name}`,
    associatedMedia: GALLERY.map((item) => ({
      '@type': 'ImageObject',
      contentUrl: absoluteUrl(`/media/${item.id}/fallback.jpg`),
      caption: item.caption ?? item.alt,
      description: item.alt,
      representativeOfPage: item.id === 'hero2',
    })),
  }
}

export default function GalleryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdGraph(breadcrumbNode(CRUMBS), galleryNode()) }}
      />

      <PageHeader
        crumbs={CRUMBS}
        eyebrow={`${GALLERY.length} photographs`}
        titleLines={['The building,', 'as it actually is']}
        lead="Shot on an ordinary weekday with the lights we normally leave on. If a tile is chipped in a picture, it is chipped in the room. That is deliberate: you should recognise the place when you walk in."
      />

      <Section tone="paper">
        <div className="container-page">
          <GalleryGrid />
        </div>
      </Section>

      <ClosingCta />
    </>
  )
}
