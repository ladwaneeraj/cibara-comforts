/**
 * Places around the property.
 *
 * Doubles as location-SEO surface and as genuinely useful information: the
 * walk times are the reason a traveller picks this lodge over one further from
 * the platform, so they are stated in minutes rather than kilometres wherever
 * a person would actually walk it.
 */
export type NearbyPlace = {
  id: string
  name: string
  /** Distance in kilometres from the property. */
  km: number
  /** Realistic walking minutes, or null when nobody would walk it. */
  walkMinutes: number | null
  category: 'transport' | 'temple' | 'nature' | 'city' | 'heritage' | 'food'
  note: string
}

export const NEARBY: NearbyPlace[] = [
  {
    id: 'harihar-railway-station',
    name: 'Harihar Railway Station',
    km: 0.8,
    walkMinutes: 10,
    category: 'transport',
    note: 'On the Bengaluru to Hubballi line. Ten minutes on foot, three by auto.',
  },
  {
    id: 'ksrtc-bus-stand',
    name: 'KSRTC Bus Stand, Harihar',
    km: 0.75,
    walkMinutes: 9,
    category: 'transport',
    note: 'Buses to Davanagere every few minutes, and overnight services to Bengaluru.',
  },
  {
    id: 'harihareshwara-temple',
    name: 'Harihareshwara Temple',
    km: 1.2,
    walkMinutes: 15,
    category: 'temple',
    note: 'The 12th century Hoysala temple to Harihara. Best visited before 8am.',
  },
  {
    id: 'tungabhadra-river',
    name: 'Tungabhadra River Ghats',
    km: 2,
    walkMinutes: 25,
    category: 'nature',
    note: 'Quiet steps down to the water. Worth the walk at sunset.',
  },
  {
    id: 'nh-48',
    name: 'NH-48 Highway Junction',
    km: 3,
    walkMinutes: null,
    category: 'transport',
    note: 'The Bengaluru to Pune corridor. A five minute detour off the highway.',
  },
  {
    id: 'davanagere',
    name: 'Davanagere City Centre',
    km: 15,
    walkMinutes: null,
    category: 'city',
    note: 'Twenty-five minutes by road. The nearest large commercial centre.',
  },
  {
    id: 'chitradurga-fort',
    name: 'Chitradurga Fort',
    km: 70,
    walkMinutes: null,
    category: 'heritage',
    note: 'Ninety minutes south. The seven-walled hill fort is a comfortable day trip.',
  },
  {
    id: 'hampi',
    name: 'Hampi (UNESCO World Heritage Site)',
    km: 140,
    walkMinutes: null,
    category: 'heritage',
    note: 'Around three hours by road. Many guests break the Bengaluru to Hampi drive here.',
  },
]

export const NEARBY_BY_ID = Object.fromEntries(NEARBY.map((n) => [n.id, n])) as Record<string, NearbyPlace>

/** Ordered walking-distance list used on the homepage location block. */
export const WALKABLE = NEARBY.filter((n) => n.walkMinutes !== null).sort((a, b) => a.km - b.km)
