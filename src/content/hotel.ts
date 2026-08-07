/**
 * Single source of truth for every business fact on the site.
 *
 * Page copy, JSON-LD, the sitemap, llms.txt, the WhatsApp deep links and the
 * footer all derive from this file. Changing a phone number or a rate here
 * changes it everywhere, which is the only way NAP consistency survives
 * contact with a real business. Nothing below should be duplicated in a
 * component.
 */

export const SITE_URL = 'https://www.cibaracomforts.com'

export const HOTEL = {
  name: 'Cibara Comforts',
  legalName: 'Cibara Comforts',
  /** Names the property is searched for. Feeds JSON-LD `alternateName`. */
  alternateNames: [
    'Cibara Lodge',
    'Cibara Comforts Harihar',
    'Cibara Comforts Hotel Harihar',
    'Cibara Lodge Harihar',
  ],
  tagline: 'Arrive late. Sleep well.',
  foundedYear: 2016,
  starRating: 3,

  address: {
    street: 'Near KSRTC Bus Stand',
    locality: 'Harihar',
    region: 'Karnataka',
    postalCode: '577601',
    country: 'IN',
    countryName: 'India',
  },

  geo: { lat: 14.5136, lng: 75.8086 },

  contact: {
    /** E.164, no punctuation. Used for tel: and wa.me links. */
    phoneE164: '+916361800647',
    phoneDisplay: '+91 63618 00647',
    receptionE164: '+918192297384',
    receptionDisplay: '08192 297384',
    /** wa.me expects the number without a leading plus. */
    whatsapp: '916361800647',
    email: 'cibaracomforts@gmail.com',
  },

  links: {
    maps: 'https://www.google.com/maps?cid=15803625024904929019',
    directions: 'https://www.google.com/maps/dir/?api=1&destination=14.5136,75.8086&destination_place_id=',
    instagram: 'https://www.instagram.com/cibara_comforts/',
    reviews: 'https://search.google.com/local/reviews?placeid=&q=Cibara+Comforts',
  },

  /** Channels the property is also listed on. Shown as a price-comparison
      honesty signal, not as booking links: the point is that direct is cheaper. */
  otas: ['Booking.com', 'MakeMyTrip', 'Goibibo'],

  checkIn: '12:00',
  checkOut: '11:00',
  receptionHours: '24 hours',

  rating: {
    value: 4.6,
    count: 312,
    source: 'Google',
  },

  /** Headline social proof. Keep these honest; they are load-bearing. */
  stats: [
    { value: '4.6', unit: '/ 5', label: 'across 312 Google reviews' },
    { value: '15,000', unit: '+', label: 'guests hosted since 2016' },
    { value: '800', unit: 'm', label: 'to Harihar railway station' },
    { value: '24', unit: 'h', label: 'reception, every day of the year' },
  ],

  payment: ['Cash', 'UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Bank transfer'],

  policies: {
    cancellation:
      'Free cancellation up to 24 hours before check-in on direct bookings. Nothing is charged until you arrive.',
    children:
      'Children under 5 stay free using existing bedding. Guests aged 5 and over, and any guest beyond two in a room, are ₹300 per night. Cribs on request.',
    pets: 'Pets are welcome. Please mention it when you book. A small cleaning fee may apply.',
    smoking: 'No smoking inside the rooms.',
    longStay: '15% off stays of seven nights or more.',
    groups:
      'Three rooms or more gets a custom rate, and complimentary breakfast on request. Useful for weddings and company visits.',
    id: 'One government photo ID per booking at check-in, as required by Karnataka law. Local IDs accepted.',
  },
} as const

export type Hotel = typeof HOTEL

export const FULL_ADDRESS = `${HOTEL.address.street}, ${HOTEL.address.locality}, ${HOTEL.address.region} ${HOTEL.address.postalCode}, ${HOTEL.address.countryName}`
