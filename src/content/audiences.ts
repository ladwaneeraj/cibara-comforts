import {
  Backpack,
  Briefcase,
  Building2,
  Heart,
  PartyPopper,
  TrainFront,
  Users,
  type LucideIcon,
} from 'lucide-react'

/**
 * Guest segments.
 *
 * Two of these have their own landing page because they carry a real search
 * intent and a different booking conversation (corporate rate cards, wedding
 * room blocks). The rest are rendered as a self-identification module: a
 * visitor who sees their own situation named converts materially better than
 * one reading generic hospitality copy.
 */
export type Audience = {
  id: string
  label: string
  /** Second person, one sentence, specific to the situation. */
  pitch: string
  icon: LucideIcon
  /** Room slug we would actually recommend. */
  recommends: string
  /** Internal link target. Null renders the card as a link to the room. */
  href: string | null
}

export const AUDIENCES: Audience[] = [
  {
    id: 'couples',
    label: 'Couples',
    pitch: 'The Premium AC room is on the quiet side of the building, away from the road and the stairwell.',
    icon: Heart,
    recommends: 'premium-ac-room',
    href: null,
  },
  {
    id: 'families',
    label: 'Families',
    pitch: 'Extra beds and cribs on request. Children under five stay free on existing bedding.',
    icon: Users,
    recommends: 'premium-room',
    href: null,
  },
  {
    id: 'corporate',
    label: 'Corporate and business',
    pitch: 'GST invoices, a desk in every room, power backup and a rate card for three rooms or more.',
    icon: Briefcase,
    recommends: 'double-room',
    href: '/corporate-stays',
  },
  {
    id: 'weddings',
    label: 'Wedding guests',
    pitch: 'Block five rooms or more for the family. We hold them, and we do not charge until arrival.',
    icon: PartyPopper,
    recommends: 'premium-ac-room',
    href: '/wedding-accommodation',
  },
  {
    id: 'rail',
    label: 'Railway and highway travellers',
    pitch: 'Ten minutes on foot from the platform, five minutes off NH-48, and reception never closes.',
    icon: TrainFront,
    recommends: 'single-room',
    href: '/hotels-near-harihar-railway-station',
  },
  {
    id: 'pilgrims',
    label: 'Pilgrims',
    pitch: 'Fifteen minutes from Harihareshwara Temple. Early departures are normal here, not a favour.',
    icon: Building2,
    recommends: 'premium-room',
    href: '/hotels-near-harihareshwara-temple',
  },
  {
    id: 'students',
    label: 'Students and backpackers',
    pitch: 'A dorm bed with a locker from ₹250, and Wi-Fi that actually reaches the bunks.',
    icon: Backpack,
    recommends: 'dormitory',
    href: null,
  },
]
