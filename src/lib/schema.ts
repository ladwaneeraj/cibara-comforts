import { AMENITIES } from '@/content/amenities'
import { FAQS, type Faq } from '@/content/faqs'
import { FULL_ADDRESS, HOTEL, SITE_URL } from '@/content/hotel'
import { NEARBY } from '@/content/nearby'
import { VERIFIED_REVIEWS } from '@/content/reviews'
import { ROOMS, type Room } from '@/content/rooms'
import { absoluteUrl } from './seo'

/**
 * Structured data.
 *
 * Built as a single connected `@graph` rather than a pile of independent
 * blocks. The `@id` cross-references are what let Google and the LLM-based
 * search engines resolve "the hotel", "its rooms", "its reviews" and "the
 * temple nearby" as one entity cluster instead of four unrelated snippets.
 * That entity linkage is most of what "knowledge graph signals" means in
 * practice.
 *
 * Node ids are stable URLs with fragments, which is the convention Google's
 * own documentation uses and what makes the graph mergeable across pages.
 */

const ID = {
  hotel: `${SITE_URL}/#hotel`,
  organization: `${SITE_URL}/#organization`,
  website: `${SITE_URL}/#website`,
  place: `${SITE_URL}/#place`,
} as const

type Json = Record<string, unknown>

function amenityFeatures() {
  return AMENITIES.map((a) => ({
    '@type': 'LocationFeatureSpecification',
    name: a.schemaName,
    value: true,
  }))
}

function aggregateRating() {
  return {
    '@type': 'AggregateRating',
    ratingValue: HOTEL.rating.value,
    reviewCount: HOTEL.rating.count,
    bestRating: 5,
    worstRating: 1,
  }
}

/**
 * Individual reviews are only emitted for entries explicitly marked verified.
 * See content/reviews.ts for why. Never relax this.
 */
function reviews() {
  return VERIFIED_REVIEWS.map((r) => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: r.author },
    datePublished: r.date,
    reviewBody: r.quote,
    reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
    publisher: { '@type': 'Organization', name: r.source },
  }))
}

function roomOffer(room: Room) {
  return {
    '@type': 'HotelRoom',
    '@id': `${SITE_URL}/rooms/${room.slug}#room`,
    name: room.name,
    description: room.summary,
    url: absoluteUrl(`/rooms/${room.slug}`),
    bed: { '@type': 'BedDetails', typeOfBed: room.bed, numberOfBeds: 1 },
    occupancy: {
      '@type': 'QuantitativeValue',
      value: room.occupancy.standard,
      maxValue: room.occupancy.max,
      unitCode: 'C62',
    },
    ...(room.sizeSqft
      ? { floorSize: { '@type': 'QuantitativeValue', value: room.sizeSqft, unitCode: 'FTK' } }
      : {}),
    amenityFeature: room.features.map((f) => ({
      '@type': 'LocationFeatureSpecification',
      name: f,
      value: true,
    })),
    ...(room.photos.length > 0 ? { image: absoluteUrl(`/media/${room.photos[0].id}/fallback.jpg`) } : {}),
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: absoluteUrl(`/rooms/${room.slug}`),
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
      result: { '@type': 'LodgingReservation', name: `Reserve the ${room.name}` },
    },
    offers: {
      '@type': 'Offer',
      price: room.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: absoluteUrl(`/rooms/${room.slug}`),
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: room.price,
        priceCurrency: 'INR',
        unitCode: 'DAY',
        // Rates quoted on the site are inclusive.
        valueAddedTaxIncluded: true,
      },
    },
  }
}

/** The Hotel node. Present on every page so the entity is unambiguous. */
export function hotelNode(): Json {
  return {
    '@type': ['Hotel', 'LodgingBusiness', 'LocalBusiness'],
    '@id': ID.hotel,
    name: HOTEL.name,
    alternateName: [...HOTEL.alternateNames],
    url: SITE_URL,
    description: `Owner-run budget hotel and lodge in Harihar, Karnataka. Clean AC and non-AC rooms and dormitory beds from ₹${Math.min(...ROOMS.map((r) => r.price))} per night, 800 metres from Harihar railway station, with 24 hour reception and free parking.`,
    image: [
      absoluteUrl('/media/hero2/fallback.jpg'),
      absoluteUrl('/media/premium1/fallback.jpg'),
      absoluteUrl('/media/double1/fallback.jpg'),
    ],
    logo: absoluteUrl('/icon.svg'),
    telephone: HOTEL.contact.phoneE164,
    email: HOTEL.contact.email,
    priceRange: '₹₹',
    currenciesAccepted: 'INR',
    paymentAccepted: [...HOTEL.payment].join(', '),
    foundingDate: String(HOTEL.foundedYear),
    starRating: { '@type': 'Rating', ratingValue: HOTEL.starRating, bestRating: 5 },
    address: {
      '@type': 'PostalAddress',
      streetAddress: HOTEL.address.street,
      addressLocality: HOTEL.address.locality,
      addressRegion: HOTEL.address.region,
      postalCode: HOTEL.address.postalCode,
      addressCountry: HOTEL.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: HOTEL.geo.lat, longitude: HOTEL.geo.lng },
    hasMap: HOTEL.links.maps,
    sameAs: [HOTEL.links.maps, HOTEL.links.instagram],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '00:00',
      closes: '23:59',
    },
    checkinTime: HOTEL.checkIn,
    checkoutTime: HOTEL.checkOut,
    numberOfRooms: ROOMS.length,
    petsAllowed: true,
    smokingAllowed: false,
    amenityFeature: amenityFeatures(),
    aggregateRating: aggregateRating(),
    ...(VERIFIED_REVIEWS.length > 0 ? { review: reviews() } : {}),
    containsPlace: ROOMS.map(roomOffer),
    makesOffer: ROOMS.map((room) => ({
      '@type': 'Offer',
      name: room.name,
      price: room.price,
      priceCurrency: 'INR',
      url: absoluteUrl(`/rooms/${room.slug}`),
      availability: 'https://schema.org/InStock',
    })),
    nearbyAttractions: NEARBY.filter((n) => n.category !== 'transport').map((n) => ({
      '@type': 'TouristAttraction',
      name: n.name,
      description: n.note,
    })),
    potentialAction: {
      '@type': 'ReserveAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `https://wa.me/${HOTEL.contact.whatsapp}`,
        inLanguage: 'en-IN',
        actionPlatform: [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
          'http://schema.org/AndroidPlatform',
          'http://schema.org/IOSPlatform',
        ],
      },
      result: { '@type': 'LodgingReservation', name: `Reserve a room at ${HOTEL.name}` },
    },
  }
}

export function websiteNode(): Json {
  return {
    '@type': 'WebSite',
    '@id': ID.website,
    url: SITE_URL,
    name: HOTEL.name,
    inLanguage: 'en-IN',
    publisher: { '@id': ID.hotel },
  }
}

export function breadcrumbNode(trail: { name: string; path: string }[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function faqNode(faqs: Faq[] = FAQS): Json {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

export function roomNode(room: Room): Json {
  return roomOffer(room) as Json
}

export function articleNode(input: {
  headline: string
  description: string
  path: string
  published: string
  modified?: string
  image?: string
}): Json {
  return {
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(input.path) },
    datePublished: input.published,
    dateModified: input.modified ?? input.published,
    author: { '@id': ID.hotel },
    publisher: { '@id': ID.hotel },
    ...(input.image ? { image: absoluteUrl(input.image) } : {}),
    inLanguage: 'en-IN',
  }
}

export function placeNode(placeId: string): Json | null {
  const place = NEARBY.find((n) => n.id === placeId)
  if (!place) return null
  return {
    '@type': place.category === 'transport' ? 'CivicStructure' : 'TouristAttraction',
    name: place.name,
    description: place.note,
    ...(place.category !== 'transport' ? { touristType: 'Traveller' } : {}),
  }
}

/**
 * Wraps nodes into one `@graph`. Call once per page.
 * Emitting a single script tag is both smaller and less error-prone than a
 * stack of them, and it lets the nodes reference each other by `@id`.
 */
export function jsonLdGraph(...nodes: (Json | null)[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': nodes.filter((n): n is Json => n !== null),
  })
}

export const SCHEMA_IDS = ID
export { FULL_ADDRESS }
