import type { MediaId } from './generated/media'

export type GalleryCategory = 'rooms' | 'details' | 'bathrooms'

export type GalleryItem = {
  id: MediaId
  alt: string
  /** Short editorial caption shown in the lightbox. Optional. */
  caption?: string
  category: GalleryCategory
  /** Layout weight in the masonry grid. `wide` spans two columns. */
  span?: 'wide' | 'tall'
}

export const GALLERY_CATEGORIES: { id: GalleryCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Everything' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'details', label: 'Details' },
  { id: 'bathrooms', label: 'Bathrooms' },
]

export const GALLERY: GalleryItem[] = [
  {
    id: 'hero2',
    alt: 'Premium air conditioned room with a queen bed, green wainscot and cane wall discs at Cibara Comforts Harihar',
    caption: 'Premium AC. The quiet side of the building.',
    category: 'rooms',
    span: 'wide',
  },
  {
    id: 'premium2',
    alt: 'Electric kettle, two cups and a complimentary tea tray beside the bed in a Premium room',
    caption: 'Tea at any hour. The kettle is yours for the night.',
    category: 'details',
    span: 'tall',
  },
  {
    id: 'hero1',
    alt: 'Premium room showing hand-painted cement tile, a dressing mirror and warm reading lamps',
    caption: 'Cement tile laid by hand, and cane discs made in the district.',
    category: 'rooms',
  },
  {
    id: 'premium1',
    alt: 'Wide view of a Premium room with twin mattresses made up as a queen and a hand-block print runner',
    category: 'rooms',
  },
  {
    id: 'premium3',
    alt: 'Premium non air conditioned room with a queen bed and warm wall lighting',
    caption: 'Premium, fan cooled. Same room, ₹600 less.',
    category: 'rooms',
  },
  {
    id: 'hero4',
    alt: 'Premium room set up with an extra bed for a third guest',
    caption: 'An extra bed goes in whenever you need it.',
    category: 'rooms',
    span: 'wide',
  },
  {
    id: 'double1',
    alt: 'Double room with a queen bed, bedside lamps and a dressing table',
    caption: 'The Double. What most repeat guests book.',
    category: 'rooms',
  },
  {
    id: 'double2',
    alt: 'Double room from the doorway showing the desk, mirror and en-suite bathroom entrance',
    category: 'rooms',
  },
  {
    id: 'single1',
    alt: 'Single room with a made bed, folded towels and a tiled washbasin counter',
    caption: 'The Single. Built for one night between trains.',
    category: 'rooms',
    span: 'tall',
  },
  {
    id: 'single3',
    alt: 'Single room with a full-length curtain, a potted plant and a neatly made single bed',
    category: 'rooms',
    span: 'tall',
  },
  {
    id: 'single2',
    alt: 'Single room showing the washbasin, mirror and a patterned tile band along the wall',
    category: 'details',
  },
  {
    id: 'single4',
    alt: 'Single room with a wall-mounted television and the en-suite bathroom door',
    category: 'rooms',
  },
  {
    id: 'hero3',
    alt: 'Bathroom with a washbasin, western toilet, health faucet and grey tiling',
    caption: 'Hot water runs all day, not for two hours in the morning.',
    category: 'bathrooms',
  },
  {
    id: 'hero5',
    alt: 'Bathroom with an overhead shower, mirror and grey tiled walls',
    category: 'bathrooms',
    span: 'tall',
  },
]
