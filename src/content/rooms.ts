import type { MediaId } from './generated/media'

/**
 * Room inventory.
 *
 * `photos` is ordered: index 0 is the card image and the OpenGraph image for
 * that room's page. An empty `photos` array is a supported state and renders a
 * designed specification panel rather than a broken gallery, which is what the
 * dormitory uses until it is photographed properly.
 */
export type Room = {
  slug: string
  name: string
  /** Short label for nav, cards and breadcrumbs. */
  shortName: string
  /** One line, used on cards and as the meta description seed. */
  summary: string
  /** Two or three sentences of honest, specific description. */
  description: string[]
  price: number
  priceUnit: 'night' | 'bed / night'
  extraPersonPrice: number | null
  occupancy: { standard: number; max: number }
  bed: string
  sizeSqft: number | null
  bathroom: 'En-suite' | 'Shared'
  ac: boolean
  features: string[]
  /** Amenity ids resolved against amenities.ts. */
  amenities: string[]
  photos: { id: MediaId; alt: string }[]
  /**
   * Shared facilities shown further down the room page. Kept separate from
   * `photos` because photos[0] is the card image and the OpenGraph image, and
   * a bathroom is the wrong first impression of a bedroom.
   */
  facilityPhotos?: { id: MediaId; alt: string; caption: string }[]
  /** Who this room is actually right for. Drives the audience-match UI. */
  bestFor: string[]
  /** Long-tail queries this page should answer. */
  keywords: string[]
  /** Marks the card the eye should land on first. Exactly one room. */
  featured?: boolean
}

export const ROOMS: Room[] = [
  {
    slug: 'premium-ac-room',
    name: 'Premium Room with Air Conditioning',
    shortName: 'Premium AC',
    summary: 'The best room in the building. Air conditioned, patterned tile, cane and brass.',
    description: [
      'This is the room we would put our own family in. Split air conditioning, a proper queen bed with a firm mattress, a flat-screen television, and the handmade cement tile and cane work that the building is known for.',
      'It faces away from the road, so it is the quietest room we have. Hot water runs all day. If you are arriving off a night train and want to sleep until eleven, take this one.',
    ],
    price: 1800,
    priceUnit: 'night',
    extraPersonPrice: 300,
    occupancy: { standard: 2, max: 4 },
    bed: 'Queen bed, plus a single on request',
    sizeSqft: 220,
    bathroom: 'En-suite',
    ac: true,
    features: [
      'Split air conditioning',
      'Flat-screen television',
      'Premium bedding and pillows',
      'Kettle, tea and coffee',
      'Writing desk and chair',
      'Quiet side of the building',
    ],
    amenities: ['wifi', 'ac', 'tv', 'hot-water', 'housekeeping', 'room-service', 'power-backup', 'parking'],
    photos: [
      { id: 'hero2', alt: 'Premium air conditioned room at Cibara Comforts with a queen bed, green wainscot walls and cane wall discs' },
      { id: 'premium2', alt: 'Electric kettle, cups and complimentary tea set on a tray beside the bed in a Premium room' },
      { id: 'hero1', alt: 'Premium room interior showing patterned cement tile, dressing mirror and reading lamps' },
      { id: 'premium1', alt: 'Wide view of the Premium room with twin mattresses made up as a queen and a hand-block print runner' },
      { id: 'hero4', alt: 'Premium room with an extra bed made up for a third guest' },
    ],
    bestFor: ['Couples', 'Corporate travellers', 'Wedding guests'],
    keywords: [
      'ac room in harihar',
      'best hotel room harihar',
      'air conditioned lodge harihar',
      'premium room near harihar railway station',
    ],
    featured: true,
  },
  {
    slug: 'premium-room',
    name: 'Premium Room, Non Air Conditioned',
    shortName: 'Premium',
    summary: 'The same room and the same bedding, minus the air conditioning.',
    description: [
      'Identical to the Premium AC room in every respect except the air conditioning: same queen bed, same television, same tile and cane. A high-throw ceiling fan and windows on two sides keep it comfortable for most of the year.',
      'Between November and February you will not miss the AC. In April and May, you will. That is the honest answer, and it is why the two rooms are priced ₹600 apart rather than hidden behind one listing.',
    ],
    price: 1200,
    priceUnit: 'night',
    extraPersonPrice: 300,
    occupancy: { standard: 2, max: 4 },
    bed: 'Queen bed, plus a single on request',
    sizeSqft: 220,
    bathroom: 'En-suite',
    ac: false,
    features: [
      'High-throw ceiling fan',
      'Flat-screen television',
      'Premium bedding and pillows',
      'Cross ventilation on two sides',
      'Writing desk and chair',
    ],
    amenities: ['wifi', 'fan', 'tv', 'hot-water', 'housekeeping', 'room-service', 'power-backup', 'parking'],
    photos: [
      { id: 'premium3', alt: 'Premium non air conditioned room at Cibara Comforts with a queen bed and warm wall lighting' },
      { id: 'hero4', alt: 'Premium room set up with an additional bed, patterned floor tile and green wainscot' },
      { id: 'premium1', alt: 'Premium room showing the dressing area, mirror and hand-painted tile detail' },
    ],
    bestFor: ['Couples', 'Families', 'Pilgrims'],
    keywords: [
      'non ac premium room harihar',
      'budget premium room harihar',
      'family room harihar lodge',
    ],
  },
  {
    slug: 'double-room',
    name: 'Double Room',
    shortName: 'Double',
    summary: 'A queen bed, a work desk and an en-suite bathroom. The straightforward choice.',
    description: [
      'A clean, plain, well-kept double. Queen bed, wardrobe, mirror, desk, en-suite bathroom with hot water. No television and no air conditioning, which is exactly why it costs what it costs.',
      'This is the room most of our repeat guests book. It does the job without any fuss.',
    ],
    price: 900,
    priceUnit: 'night',
    extraPersonPrice: 300,
    occupancy: { standard: 2, max: 3 },
    bed: 'Queen bed',
    sizeSqft: 160,
    bathroom: 'En-suite',
    ac: false,
    features: ['Queen bed', 'Work desk and chair', 'Wardrobe and mirror', 'Ceiling fan', 'En-suite with hot water'],
    amenities: ['wifi', 'fan', 'hot-water', 'housekeeping', 'power-backup', 'parking'],
    photos: [
      { id: 'double1', alt: 'Double room at Cibara Comforts with a queen bed, bedside lamps and a dressing table' },
      { id: 'double2', alt: 'Double room from the doorway showing the desk, mirror and en-suite bathroom entrance' },
    ],
    bestFor: ['Couples', 'Business travellers', 'Railway travellers'],
    keywords: ['double room harihar', 'cheap double room harihar', 'lodge room near ksrtc bus stand harihar'],
  },
  {
    slug: 'single-room',
    name: 'Single Room',
    shortName: 'Single',
    summary: 'One bed, one desk, your own bathroom. Built for one night between trains.',
    description: [
      'A compact single with its own en-suite bathroom, a desk and a ceiling fan. Small on purpose and priced accordingly.',
      'Most guests in this room are here for one night: a sales call in Davanagere, an early train, a temple visit at dawn. It is warm, it is clean, and the door locks properly.',
    ],
    price: 450,
    priceUnit: 'night',
    extraPersonPrice: 300,
    occupancy: { standard: 1, max: 2 },
    bed: 'Single bed',
    sizeSqft: 100,
    bathroom: 'En-suite',
    ac: false,
    features: ['Single bed', 'Desk and chair', 'Ceiling fan', 'En-suite with hot water', 'Reading light'],
    amenities: ['wifi', 'fan', 'hot-water', 'housekeeping', 'power-backup', 'parking'],
    photos: [
      { id: 'single1', alt: 'Single room at Cibara Comforts with a made bed, folded towels and a tiled washbasin counter' },
      { id: 'single3', alt: 'Single room with a full-length curtain, potted plant and neatly made single bed' },
      { id: 'single2', alt: 'Single room showing the washbasin, mirror and patterned tile band along the wall' },
      { id: 'single4', alt: 'Single room with a wall-mounted television and the en-suite bathroom door' },
    ],
    bestFor: ['Solo travellers', 'Business travellers', 'Students'],
    keywords: [
      'single room harihar',
      'cheap single room near harihar railway station',
      'solo traveller lodge harihar',
    ],
  },
  {
    slug: 'dormitory',
    name: 'Dormitory Bed',
    shortName: 'Dorm',
    summary: 'A bunk, a locker and a clean shared bathroom, from ₹250.',
    description: [
      'Metal-frame bunks in a fan-cooled shared room, one lockable steel locker per bed, and a shared bathroom kept on the same housekeeping round as every other room in the building.',
      'It is a dormitory and we describe it as one. What we will promise is that the sheets are changed between guests, the lights work, and reception is staffed if you come in at three in the morning.',
    ],
    price: 250,
    priceUnit: 'bed / night',
    extraPersonPrice: null,
    occupancy: { standard: 1, max: 1 },
    bed: 'Bunk bed, single mattress',
    sizeSqft: null,
    bathroom: 'Shared',
    ac: false,
    features: [
      'Lockable steel locker per bed',
      'Fresh linen between every guest',
      'Ceiling fans throughout',
      'Shared bathroom with 24 hour hot water',
      'Charging point at each bunk',
    ],
    amenities: ['wifi', 'fan', 'hot-water', 'housekeeping', 'power-backup', 'parking', 'cctv'],
    photos: [],
    facilityPhotos: [
      {
        id: 'hero3',
        alt: 'The shared bathroom used by the dormitory at Cibara Comforts, with a washbasin, western toilet and grey tiling',
        caption: 'The shared bathroom. Hot water runs all day, and it is on the same housekeeping round as every private room.',
      },
    ],
    bestFor: ['Students', 'Backpackers', 'Pilgrim groups'],
    keywords: [
      'dormitory in harihar',
      'cheapest stay in harihar',
      'dorm bed near harihar railway station',
      'hostel harihar karnataka',
    ],
  },
]

export const ROOMS_BY_SLUG = Object.fromEntries(ROOMS.map((r) => [r.slug, r])) as Record<string, Room>

/** Lowest advertised rate, used in hero copy, JSON-LD and meta descriptions. */
export const LOWEST_RATE = Math.min(...ROOMS.map((r) => r.price))
export const HIGHEST_RATE = Math.max(...ROOMS.map((r) => r.price))

export function formatINR(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`
}
