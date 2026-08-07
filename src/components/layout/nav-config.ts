import { ROOMS } from '@/content/rooms'

/**
 * Navigation, and the internal-link graph that comes with it.
 *
 * Deliberately shallow: every page is reachable in two clicks from anywhere.
 * Flat hierarchies both convert better and distribute link equity better than
 * deep ones, and this site has no content deep enough to justify a third
 * level.
 */
export const PRIMARY_NAV = [
  {
    label: 'Rooms',
    href: '/rooms',
    children: ROOMS.map((r) => ({
      label: r.shortName,
      href: `/rooms/${r.slug}`,
      description: r.summary,
      price: r.price,
    })),
  },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Getting here', href: '/location' },
  { label: 'Guides', href: '/guides' },
  { label: 'Contact', href: '/contact' },
] as const

export const FOOTER_NAV = [
  {
    heading: 'Rooms',
    links: ROOMS.map((r) => ({ label: r.name, href: `/rooms/${r.slug}` })),
  },
  {
    heading: 'Stay with us',
    links: [
      { label: 'Corporate stays', href: '/corporate-stays' },
      { label: 'Wedding accommodation', href: '/wedding-accommodation' },
      { label: 'Offers and long stays', href: '/offers' },
      { label: 'Gallery', href: '/gallery' },
      { label: 'Frequently asked questions', href: '/faq' },
    ],
  },
  {
    heading: 'Harihar',
    links: [
      { label: 'Hotels in Harihar', href: '/hotels-in-harihar' },
      { label: 'Near the railway station', href: '/hotels-near-harihar-railway-station' },
      { label: 'Near Harihareshwara Temple', href: '/hotels-near-harihareshwara-temple' },
      { label: 'On the way to Hampi', href: '/stay-near-hampi' },
      { label: 'Travel guides', href: '/guides' },
    ],
  },
  {
    heading: 'The hotel',
    links: [
      { label: 'About Cibara Comforts', href: '/about' },
      { label: 'Getting here', href: '/location' },
      { label: 'Contact and reception', href: '/contact' },
      { label: 'Policies', href: '/policies' },
      { label: 'Privacy', href: '/privacy' },
    ],
  },
] as const
