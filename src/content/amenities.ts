import {
  AirVent,
  BatteryCharging,
  Bath,
  BedDouble,
  CircleParking,
  Coffee,
  ConciergeBell,
  Dog,
  Fan,
  Loader,
  ShieldCheck,
  Sparkles,
  Tv,
  Wifi,
  type LucideIcon,
} from 'lucide-react'

export type Amenity = {
  id: string
  label: string
  /** One short clarifying line. Specifics beat adjectives. */
  detail: string
  icon: LucideIcon
  /** Shown in the headline amenity grid on the homepage. */
  headline?: boolean
  /** Maps to schema.org LocationFeatureSpecification names. */
  schemaName: string
}

export const AMENITIES: Amenity[] = [
  {
    id: 'wifi',
    label: 'Free Wi-Fi',
    detail: 'In every room, not just the lobby',
    icon: Wifi,
    headline: true,
    schemaName: 'Free WiFi',
  },
  {
    id: 'parking',
    label: 'Free parking',
    detail: 'Cars and two-wheelers, on site, under CCTV',
    icon: CircleParking,
    headline: true,
    schemaName: 'Free parking',
  },
  {
    id: 'reception',
    label: '24 hour reception',
    detail: 'Someone is awake whenever your train gets in',
    icon: ConciergeBell,
    headline: true,
    schemaName: '24-hour front desk',
  },
  {
    id: 'hot-water',
    label: 'Hot water, all day',
    detail: 'Not a two-hour morning window',
    icon: Bath,
    headline: true,
    schemaName: 'Hot water',
  },
  {
    id: 'power-backup',
    label: 'Power backup',
    detail: 'Fans, lights and Wi-Fi stay on through a cut',
    icon: BatteryCharging,
    headline: true,
    schemaName: 'Power backup',
  },
  {
    id: 'cctv',
    label: 'CCTV and safe access',
    detail: 'Monitored corridors and entrance. Solo female travellers welcome',
    icon: ShieldCheck,
    headline: true,
    schemaName: 'Security',
  },
  {
    id: 'ac',
    label: 'Air conditioning',
    detail: 'On Premium AC rooms',
    icon: AirVent,
    schemaName: 'Air conditioning',
  },
  { id: 'fan', label: 'Ceiling fan', detail: 'In every room', icon: Fan, schemaName: 'Fan' },
  { id: 'tv', label: 'Flat-screen TV', detail: 'On Premium rooms', icon: Tv, schemaName: 'Television' },
  {
    id: 'housekeeping',
    label: 'Daily housekeeping',
    detail: 'Rooms turned over between every guest',
    icon: Sparkles,
    schemaName: 'Daily housekeeping',
  },
  {
    id: 'room-service',
    label: 'Room service',
    detail: 'Tea, coffee and food to the door',
    icon: Coffee,
    schemaName: 'Room service',
  },
  { id: 'laundry', label: 'Laundry', detail: 'Same-day if in before 10am', icon: Loader, schemaName: 'Laundry service' },
  {
    id: 'pets',
    label: 'Pet friendly',
    detail: 'Tell us at booking and they are welcome',
    icon: Dog,
    schemaName: 'Pets allowed',
  },
  {
    id: 'extra-bed',
    label: 'Extra beds and cribs',
    detail: 'On request, ₹300 per extra guest',
    icon: BedDouble,
    schemaName: 'Extra beds available',
  },
]

export const AMENITIES_BY_ID = Object.fromEntries(AMENITIES.map((a) => [a.id, a])) as Record<string, Amenity>

export const HEADLINE_AMENITIES = AMENITIES.filter((a) => a.headline)
