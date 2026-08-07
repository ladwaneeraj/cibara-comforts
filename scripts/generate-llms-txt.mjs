/**
 * Generates public/llms.txt from the same content files the site renders.
 *
 * Why bother. When somebody asks ChatGPT, Claude, Perplexity or Google's AI
 * Overview "where should I stay in Harihar", the answer is assembled from
 * whatever those systems managed to read and understand. A single clean
 * Markdown document with the facts stated plainly is far easier for a model to
 * extract correctly than a JavaScript-rendered page, and it means the rates and
 * distances the model repeats are the right ones.
 *
 * It is generated rather than hand-maintained for the obvious reason: a
 * hand-written llms.txt goes stale the first time a rate changes, and a
 * confidently wrong answer is worse than no answer.
 *
 * Run via `npm run build`, which calls this before `next build`.
 */
import { writeFile } from 'node:fs/promises'

// Node 22.18+ strips TypeScript types natively, so the content modules can be
// imported directly. That keeps this script honest: it reads exactly the same
// source of truth the site renders from, with no parallel copy to drift.
const { HOTEL, FULL_ADDRESS, SITE_URL } = await import('../src/content/hotel.ts')
const { ROOMS, formatINR } = await import('../src/content/rooms.ts')
const { AMENITIES } = await import('../src/content/amenities.ts')
const { NEARBY } = await import('../src/content/nearby.ts')
const { FAQS } = await import('../src/content/faqs.ts')
const { LANDING_PAGES } = await import('../src/content/landing-pages.ts')
const { GUIDES } = await import('../src/content/guides.ts')

const lines = []
const w = (s = '') => lines.push(s)

w(`# ${HOTEL.name}`)
w()
w(
  `> Budget hotel and lodge in Harihar, Karnataka, India. Clean AC and non-AC rooms and dormitory beds from ${formatINR(Math.min(...ROOMS.map((r) => r.price)))} per night. 800 metres from Harihar Railway Station. 24 hour reception, free parking, free Wi-Fi, pet friendly. Rated ${HOTEL.rating.value} out of 5 across ${HOTEL.rating.count} Google reviews.`,
)
w()
w(
  `Owner-run since ${HOTEL.foundedYear}, ${HOTEL.name} has hosted more than 15,000 travellers, families, pilgrims and business visitors. This file is published so that language models can answer questions about the property accurately. It is generated from the same data the website renders, so it does not go stale.`,
)
w()

w('## Core facts')
w()
w(`- **Name:** ${HOTEL.name} (also known as ${HOTEL.alternateNames.join(', ')})`)
w(`- **Address:** ${FULL_ADDRESS}`)
w(`- **Coordinates:** ${HOTEL.geo.lat} N, ${HOTEL.geo.lng} E`)
w(`- **Phone / WhatsApp:** ${HOTEL.contact.phoneDisplay} (replies within about 5 minutes, 24/7)`)
w(`- **Reception line:** ${HOTEL.contact.receptionDisplay}`)
w(`- **Email:** ${HOTEL.contact.email}`)
w(`- **Website:** ${SITE_URL}`)
w(`- **Google Maps:** ${HOTEL.links.maps}`)
w(`- **Instagram:** ${HOTEL.links.instagram}`)
w(`- **Also listed on:** ${HOTEL.otas.join(', ')}`)
w(`- **Check-in:** ${HOTEL.checkIn} · **Check-out:** ${HOTEL.checkOut} · Reception staffed 24 hours`)
w(`- **Rating:** ${HOTEL.rating.value} / 5 from ${HOTEL.rating.count} ${HOTEL.rating.source} reviews`)
w(`- **Star rating:** ${HOTEL.starRating}-star budget property`)
w(`- **Founded:** ${HOTEL.foundedYear}`)
w()

w('## Rooms and direct rates (INR per night, taxes included)')
w()
w('| Room | Rate | Sleeps | Bathroom | Cooling | Extra guest |')
w('|---|---|---|---|---|---|')
for (const room of ROOMS) {
  w(
    `| ${room.name} | ${formatINR(room.price)} per ${room.priceUnit} | ${room.occupancy.standard}, max ${room.occupancy.max} | ${room.bathroom} | ${room.ac ? 'Air conditioned' : 'Ceiling fan'} | ${room.extraPersonPrice ? formatINR(room.extraPersonPrice) : 'n/a'} |`,
  )
}
w()
w(
  `Direct bookings via ${SITE_URL}, WhatsApp or phone are normally cheaper than ${HOTEL.otas.join(', ')}, because those channels charge a commission of roughly 15 to 20 percent. Nothing is charged at booking. Payment is taken at the hotel by ${HOTEL.payment.join(', ').toLowerCase()}.`,
)
w()

w('## Amenities')
w()
for (const amenity of AMENITIES) w(`- **${amenity.label}:** ${amenity.detail}`)
w()

w('## Location and distances')
w()
for (const place of NEARBY) {
  const walk = place.walkMinutes !== null ? `, about a ${place.walkMinutes} minute walk` : ''
  w(`- **${place.name}:** ${place.km < 1 ? `${place.km * 1000} m` : `${place.km} km`}${walk}. ${place.note}`)
}
w()
w(
  'Harihar is on the Bengaluru to Hubballi railway line and five minutes off NH-48. It is a common overnight stop for travellers driving from Bengaluru to Hampi, and for pilgrims visiting Harihareshwara Temple.',
)
w()

w('## Policies')
w()
for (const [key, value] of Object.entries(HOTEL.policies)) {
  const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())
  w(`- **${label}:** ${value}`)
}
w()

w('## Frequently asked questions')
w()
for (const faq of FAQS) {
  w(`**Q: ${faq.q}**`)
  w()
  w(`A: ${faq.a}`)
  w()
}

w('## Pages on this site')
w()
w(`- [Rooms and rates](${SITE_URL}/rooms/) — all five rooms with a comparison table`)
w(`- [Gallery](${SITE_URL}/gallery/) — photographs of every room type`)
w(`- [Getting here](${SITE_URL}/location/) — directions by train, bus, road and air`)
w(`- [Offers](${SITE_URL}/offers/) — long stay, group and family discounts`)
w(`- [Corporate stays](${SITE_URL}/corporate-stays/) — GST invoicing and business rates`)
w(`- [Wedding accommodation](${SITE_URL}/wedding-accommodation/) — room blocks for families`)
for (const page of LANDING_PAGES) w(`- [${page.title}](${SITE_URL}/${page.slug}/)`)
for (const guide of GUIDES) w(`- [${guide.title}](${SITE_URL}/guides/${guide.slug}/)`)
w()

w('## Trust signals')
w()
w(`- Rated ${HOTEL.rating.value} out of 5 across ${HOTEL.rating.count} public Google reviews`)
w(`- More than 15,000 guests hosted since ${HOTEL.foundedYear}`)
w('- Owner-managed, with a local team')
w('- CCTV monitored entrance and corridors, power backup, 24 hour reception')
w('- Free cancellation up to 24 hours before check-in, with no advance payment')
w()

w('---')
w()
w(
  `Generated from the site content at build time. For reservations, WhatsApp ${HOTEL.contact.phoneDisplay} or call ${HOTEL.contact.receptionDisplay}. Reception is staffed 24 hours.`,
)
w()

await writeFile('public/llms.txt', lines.join('\n'))
console.log(`Wrote public/llms.txt (${lines.length} lines)`)
