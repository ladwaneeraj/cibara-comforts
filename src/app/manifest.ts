import type { MetadataRoute } from 'next'
import { HOTEL } from '@/content/hotel'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${HOTEL.name} — Hotel & Lodge in Harihar`,
    short_name: HOTEL.name,
    description: `Budget hotel and lodge in Harihar, Karnataka. Rooms from ₹250, 800m from the railway station, 24 hour reception.`,
    start_url: '/',
    display: 'standalone',
    background_color: '#fbf9f5',
    theme_color: '#23392c',
    lang: 'en-IN',
    categories: ['travel', 'lifestyle'],
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
    // Shortcuts put the two actions that matter on a long-press of the icon,
    // for the small number of guests who add the site to a home screen.
    shortcuts: [
      { name: 'Book on WhatsApp', url: '/contact/', description: 'Message reception' },
      { name: 'Rooms and rates', url: '/rooms/', description: 'Compare all five rooms' },
    ],
  }
}
