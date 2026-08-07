import type { Metadata } from 'next'
import { AmenitiesGrid } from '@/components/sections/amenities-grid'
import { Audiences } from '@/components/sections/audiences'
import { ClosingCta } from '@/components/sections/closing-cta'
import { Faqs } from '@/components/sections/faq'
import { Hero } from '@/components/sections/hero'
import { Location } from '@/components/sections/location'
import { Manifesto } from '@/components/sections/manifesto'
import { Reviews } from '@/components/sections/reviews'
import { RoomsShowcase } from '@/components/sections/rooms-showcase'
import { GalleryTeaser } from '@/components/sections/gallery-teaser'
import { TrustStrip } from '@/components/sections/trust-strip'
import { HOTEL } from '@/content/hotel'
import { HOMEPAGE_FAQS } from '@/content/faqs'
import { faqNode, jsonLdGraph } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  ...pageMetadata({
    title: `${HOTEL.name} | Budget Hotel & Lodge in Harihar, Karnataka`,
    description: `Owner-run lodge 800m from Harihar railway station. Rooms and dorm beds from ₹250 a night. 4.6★ from ${HOTEL.rating.count} Google reviews. 24h reception, free parking.`,
    path: '/',
    image: '/media/hero2/fallback.jpg',
    imageAlt: `A Premium room at ${HOTEL.name} in Harihar`,
  }),
  // The root layout already sets the default title; overriding it here avoids
  // the template appending the property name twice on the homepage.
  title: {
    absolute: `${HOTEL.name} | Budget Hotel & Lodge in Harihar, Karnataka`,
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdGraph(faqNode(HOMEPAGE_FAQS)) }}
      />

      <Hero />
      <TrustStrip />
      <Manifesto />
      <RoomsShowcase />
      <AmenitiesGrid />
      <Audiences />
      <GalleryTeaser />
      <Location />
      <Reviews />
      <Faqs items={HOMEPAGE_FAQS} />
      <ClosingCta />
    </>
  )
}
