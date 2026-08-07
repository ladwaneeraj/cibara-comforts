import type { MediaId } from './generated/media'

/**
 * Location and intent landing pages.
 *
 * These are the long-tail SEO surface: the queries people actually type when
 * they are close to booking ("hotel near harihar railway station", "where to
 * stay on the way to hampi"). Each one is a real page with real content
 * written for that intent, not a template with the town name swapped, because
 * the swap-the-town approach is doorway-page spam under Google's guidelines
 * and gets the whole site demoted.
 *
 * They live in one data file rather than five near-identical page components,
 * driven by app/[landing]/page.tsx. Adding a page is adding an object here.
 */
export type LandingPage = {
  slug: string
  /** Page <title>, under 60 characters including the site suffix. */
  title: string
  metaDescription: string
  eyebrow: string
  /** Display heading, split into masked lines. */
  headingLines: string[]
  lead: string
  heroImage: MediaId
  /** Body sections. `intent` states plainly who the page is for. */
  intent: string
  sections: { heading: string; body: string[] }[]
  /** Facts rendered as a compact key/value strip. */
  facts: { label: string; value: string }[]
  /** Room slugs to surface, in order of relevance to this intent. */
  recommendedRooms: string[]
  /** Related pages, for internal linking. */
  related: { label: string; href: string }[]
  /** Extra FAQs specific to this intent, appended to the shared set. */
  faqs: { q: string; a: string }[]
}

export const LANDING_PAGES: LandingPage[] = [
  {
    slug: 'hotels-in-harihar',
    title: 'Hotels in Harihar: An Honest Guide to Where to Stay',
    metaDescription:
      'A straight guide to hotels and lodges in Harihar, Karnataka: what a room actually costs, which areas are convenient, and where Cibara Comforts fits.',
    eyebrow: 'Where to stay in Harihar',
    headingLines: ['Hotels in Harihar,', 'described honestly'],
    lead: 'Harihar is a working town on the Bengaluru to Hubballi line, not a resort destination. The accommodation reflects that, and this page tells you what to expect before you book anything, including from us.',
    heroImage: 'hero4',
    intent:
      'For anyone searching for a hotel or lodge in Harihar and trying to work out what is available and what it should cost.',
    sections: [
      {
        heading: 'What accommodation in Harihar actually looks like',
        body: [
          'Harihar has no five-star hotel and no boutique property, and anyone telling you otherwise is describing Davanagere. What the town has is a cluster of lodges and budget hotels, most of them within a kilometre of the railway station and the KSRTC bus stand, priced between roughly ₹250 for a dormitory bed and ₹2,500 for the best air conditioned room in town.',
          'The useful question is therefore not which hotel is most luxurious. It is which one is clean, which one has hot water that works, which one has somebody awake when your train is three hours late, and which one is close enough to walk to with a bag.',
        ],
      },
      {
        heading: 'Where to stay, by area',
        body: [
          'Near the railway station and bus stand. The most convenient area by a wide margin, and where most of the lodges are. If you are in Harihar for one or two nights between journeys, stay here. Everything is walkable and autos are cheap and plentiful.',
          'Near Harihareshwara Temple. Quieter, about 1.2 kilometres from the station, and closer to the river. Convenient if the temple is your reason for coming, though the walk from the station area takes only fifteen minutes anyway.',
          'On the NH-48 highway strip. Some rooms attached to highway restaurants. Fine if you are driving through and leaving at dawn, less good if you want to see the town, and noisy.',
          'Davanagere, fifteen kilometres away. A bigger city with more choice and higher prices. Worth it only if you specifically need a business hotel with a conference room.',
        ],
      },
      {
        heading: 'What you should expect to pay',
        body: [
          'A dormitory bed in Harihar runs ₹200 to ₹350. A basic private single with an attached bathroom is ₹400 to ₹700. A double is ₹800 to ₹1,200. An air conditioned room is ₹1,500 to ₹2,500. Anything materially above that range is either in Davanagere or is charging you for a wedding hall attached to the property.',
          'Rates on Booking.com, MakeMyTrip and Goibibo include a commission of roughly 15 to 20 percent, which the property pays and therefore prices in. Almost every lodge in town, including this one, will match or beat the listed rate if you telephone or message directly. That is not a secret and it is not a favour: it simply costs us less.',
        ],
      },
      {
        heading: 'Where Cibara Comforts fits',
        body: [
          'We are a 3-star budget property in the station and bus stand cluster, running since 2016, rated 4.6 out of 5 across 312 Google reviews. Five room types from a ₹250 dormitory bed to an ₹1,800 air conditioned Premium room.',
          'We are not the cheapest bed in Harihar and we do not try to be. What we are is consistent: linen changed between guests, hot water around the clock rather than for two hours in the morning, a generator that keeps the fan and the Wi-Fi running through a power cut, free parking under CCTV, and reception staffed twenty-four hours so a late arrival is normal rather than a problem.',
          'If your only criterion is price, there are two or three cheaper options within walking distance and we would rather you were comfortable than loyal. If your criterion is that the room should be exactly what the photographs showed, we are a reasonable bet.',
        ],
      },
    ],
    facts: [
      { label: 'Cheapest bed in town, roughly', value: '₹200 to ₹350' },
      { label: 'Typical private double', value: '₹800 to ₹1,200' },
      { label: 'Typical AC room', value: '₹1,500 to ₹2,500' },
      { label: 'Best area for one-night stays', value: 'Station and bus stand' },
    ],
    recommendedRooms: ['premium-ac-room', 'double-room', 'single-room'],
    related: [
      { label: 'Near Harihar railway station', href: '/hotels-near-harihar-railway-station' },
      { label: 'Near Harihareshwara Temple', href: '/hotels-near-harihareshwara-temple' },
      { label: 'Breaking the drive to Hampi', href: '/stay-near-hampi' },
      { label: 'Getting to Harihar', href: '/location' },
    ],
    faqs: [
      {
        q: 'Is Harihar worth stopping in?',
        a: 'For a night, yes. Harihareshwara Temple is a genuine 12th century Hoysala site and takes an hour to see properly, the Tungabhadra ghats are quiet at sunset, and the town is a natural break on the Bengaluru to Hampi or Bengaluru to Hubballi drive. As a multi-day destination it is thin, and most visitors treat it as a stop rather than a stay.',
      },
      {
        q: 'Is Harihar safe at night?',
        a: 'The station and bus stand area is busy and lit until late, and autos run past midnight. Normal small-town precautions apply and nothing beyond them. Solo women travellers stay in Harihar regularly, and every private room at Cibara Comforts has its own bathroom so there is no shared-corridor trip at night.',
      },
    ],
  },

  {
    slug: 'hotels-near-harihar-railway-station',
    title: 'Hotels Near Harihar Railway Station (800m Walk)',
    metaDescription:
      'Cibara Comforts is 800m from Harihar railway station, a 10 minute walk. Rooms from ₹250, 24 hour reception for late trains, nothing paid in advance.',
    eyebrow: '800 metres from platform 1',
    headingLines: ['Ten minutes', 'from the platform'],
    lead: 'If your train gets in at two in the morning, the distance between the station and your bed is the only specification that matters. Ours is eight hundred metres and somebody will be awake.',
    heroImage: 'double1',
    intent:
      'For rail travellers looking for a room within walking distance of Harihar railway station, often with an awkward arrival or departure time.',
    sections: [
      {
        heading: 'The walk, described properly',
        body: [
          'Leave the station by the main exit and turn right onto the station road. Walk straight for roughly seven hundred metres in the direction of the KSRTC bus stand. We are on the left, shortly before the bus stand, with the Cibara Comforts board on the front.',
          'It takes ten minutes at a normal pace with a bag, less without one. It is lit the whole way and there are shops open late along most of it. If you would rather take an auto, it should cost ₹30 to ₹50 and takes about three minutes. Tell the driver "Cibara Comforts, KSRTC bus stand ke pass".',
        ],
      },
      {
        heading: 'Late trains are the normal case, not the exception',
        body: [
          'Reception is staffed twenty-four hours a day, every day of the year. There is no late check-in window, no surcharge, and nobody will be annoyed. A meaningful share of our guests arrive between eleven at night and four in the morning, because that is when the trains on this line arrive.',
          'Message your PNR or your expected arrival time on WhatsApp before you board and the room will be ready and the gate open. If your train is delayed, we will simply hold it.',
        ],
      },
      {
        heading: 'Early departures',
        body: [
          'Check-out is 11:00 AM, but if you are catching a 5:00 AM train nobody needs to see you off. Leave the key at the desk. If you have paid at check-in, which most guests do, there is nothing else to settle.',
          'If you need a wake-up call, ask at reception. If you need an auto at four in the morning, ask the night desk the evening before and one will be waiting.',
        ],
      },
      {
        heading: 'Day rooms between trains',
        body: [
          'If you have a long layover rather than an overnight, ask about a day rate. A room for a shower, a sleep and a change of clothes between two trains is a common request here and it is usually cheaper than a full night. It depends on occupancy, so message on the day rather than booking ahead.',
        ],
      },
    ],
    facts: [
      { label: 'Distance to Harihar railway station', value: '800 m' },
      { label: 'Walking time', value: '10 minutes' },
      { label: 'Auto fare, approximately', value: '₹30 to ₹50' },
      { label: 'Reception', value: 'Staffed 24 hours' },
    ],
    recommendedRooms: ['single-room', 'double-room', 'dormitory'],
    related: [
      { label: 'Full directions and transport', href: '/location' },
      { label: 'All hotels in Harihar, compared', href: '/hotels-in-harihar' },
      { label: 'Near Harihareshwara Temple', href: '/hotels-near-harihareshwara-temple' },
    ],
    faqs: [
      {
        q: 'How far is Cibara Comforts from Harihar railway station?',
        a: 'Eight hundred metres, which is a ten minute walk or a three minute auto ride costing ₹30 to ₹50. The KSRTC bus stand is even closer at 750 metres.',
      },
      {
        q: 'Can I check in at 3 AM after a delayed train?',
        a: 'Yes. Reception is staffed twenty-four hours with no late check-in fee and no cut-off. Message your arrival time on WhatsApp and the room will be ready whenever you get in.',
      },
      {
        q: 'Do you have rooms for a few hours between trains?',
        a: 'Often, yes. Day rates depend on occupancy, so message on the day rather than booking ahead and reception will tell you straight away.',
      },
    ],
  },

  {
    slug: 'hotels-near-harihareshwara-temple',
    title: 'Where to Stay Near Harihareshwara Temple, Harihar',
    metaDescription:
      'Cibara Comforts is 1.2km from Harihareshwara Temple, a 15 minute walk. Rooms from ₹250, early departures are routine, group rates for pilgrim parties.',
    eyebrow: '1.2 km from the temple',
    headingLines: ['Fifteen minutes', 'from Harihareshwara'],
    lead: 'The temple is at its best before eight in the morning, before the heat and before the crowd. Staying fifteen minutes away is how you manage that without hiring a car.',
    heroImage: 'premium3',
    intent:
      'For pilgrims and visitors to the 12th century Harihareshwara Temple looking for accommodation within walking distance.',
    sections: [
      {
        heading: 'About the temple',
        body: [
          'Harihareshwara Temple is a Hoysala-period temple dedicated to Harihara, the composite form of Vishnu and Shiva, and it is what the town is named for. The central image is split down the middle: Hari on one side, Hara on the other. The stonework on the outer walls is the reason art historians make the trip.',
          'It is an active temple rather than a monument, so it fills up on festival days and on weekends. Early morning on a weekday is when you will have the place more or less to yourself.',
        ],
      },
      {
        heading: 'Getting there from us',
        body: [
          'It is 1.2 kilometres, a fifteen minute walk through the town, or about five minutes and ₹30 by auto. The walk is pleasant in the early morning and unpleasant at two in the afternoon in April, which is a reasonable argument for the early start anyway.',
          'From the temple it is another ten minutes down to the Tungabhadra ghats, which are worth the detour at sunset.',
        ],
      },
      {
        heading: 'Early starts are routine here',
        body: [
          'Reception is staffed around the clock, so leaving at half past five to be at the temple for the morning is not a favour anyone needs to grant. Tell the night desk and they will have the gate open.',
          'If you want tea before you go, ask the evening before and it will be ready. There is no in-house restaurant, but there are places open early near the bus stand.',
        ],
      },
      {
        heading: 'For pilgrim groups',
        body: [
          'Blocks of three rooms or more get a custom rate, and complimentary breakfast on request. We hold the rooms without any advance payment, and one person can settle the whole booking at the desk on arrival rather than everyone paying separately.',
          'For larger parties, message the dates on WhatsApp and reception will tell you what can be held. Dormitory beds work well for younger members of a group at ₹250 each.',
        ],
      },
    ],
    facts: [
      { label: 'Distance to Harihareshwara Temple', value: '1.2 km' },
      { label: 'Walking time', value: '15 minutes' },
      { label: 'Best time to visit', value: 'Before 8:00 AM' },
      { label: 'Group rate applies from', value: '3 rooms' },
    ],
    recommendedRooms: ['premium-room', 'double-room', 'dormitory'],
    related: [
      { label: 'All hotels in Harihar, compared', href: '/hotels-in-harihar' },
      { label: 'Near the railway station', href: '/hotels-near-harihar-railway-station' },
      { label: 'Getting here', href: '/location' },
    ],
    faqs: [
      {
        q: 'How far is Harihareshwara Temple from Cibara Comforts?',
        a: '1.2 kilometres, about a fifteen minute walk or a five minute auto ride costing around ₹30. The temple is best visited before 8:00 AM, and early departures are routine here because reception is staffed 24 hours.',
      },
      {
        q: 'Do you offer group rates for pilgrim parties?',
        a: 'Yes. Three rooms or more gets a custom rate and complimentary breakfast on request. Rooms are held without advance payment and one person can settle the whole booking at check-in.',
      },
    ],
  },

  {
    slug: 'stay-near-hampi',
    title: 'Breaking the Bengaluru to Hampi Drive in Harihar',
    metaDescription:
      'Harihar is 140km from Hampi and 270km from Bengaluru, a natural overnight stop. Rooms from ₹250, free parking, and a dawn start beats the heat at Hampi.',
    eyebrow: '140 km from Hampi',
    headingLines: ['Sleep in Harihar,', 'reach Hampi by breakfast'],
    lead: 'Driving Bengaluru to Hampi in one go is seven hours and arrives at the worst part of the day. Splitting it at Harihar costs one night and buys you the ruins in the cool of the morning.',
    heroImage: 'hero1',
    intent:
      'For travellers driving or taking the train between Bengaluru and Hampi who want a sensible overnight stop.',
    sections: [
      {
        heading: 'Why break the drive here',
        body: [
          'Bengaluru to Hampi is roughly 340 kilometres and, realistically, six and a half to eight hours with stops. Leaving Bengaluru in the morning puts you at Hampi in the early afternoon, which is when the ruins are hottest, most crowded and least photogenic.',
          'Harihar sits at around 270 kilometres from Bengaluru, four to five hours in, and 140 kilometres from Hampi, about three hours out. Stopping here means an easy afternoon drive, a full night, and a 5:00 AM start that has you at Virupaksha for sunrise with the site nearly empty.',
        ],
      },
      {
        heading: 'The practicalities',
        body: [
          'Free parking on site for cars, under CCTV, with no charge and nothing to reserve. Power backup keeps the fan and the Wi-Fi going through a cut. Hot water runs around the clock, which matters if you are leaving before dawn.',
          'Check-in is from noon and reception never closes, so an evening arrival is fine. Nothing is charged in advance and you can cancel free until twenty-four hours before, which is useful when you are not sure how far you will get in a day.',
        ],
      },
      {
        heading: 'The dawn run to Hampi',
        body: [
          'Leave Harihar at five and you will be at Hampi by eight, before the heat and before the tour buses. The road runs through Ranebennur and Hospet and is decent tarmac most of the way.',
          'If you are going on to Badami or Aihole afterwards, Harihar also works as the return-leg stop. Tell reception and they will hold the same room.',
        ],
      },
      {
        heading: 'Worth an hour before you leave',
        body: [
          'Harihareshwara Temple is fifteen minutes away on foot and is a genuine Hoysala site, not a consolation prize. If you are stopping anyway, it is worth being up an hour earlier for.',
          'Chitradurga Fort is 70 kilometres back towards Bengaluru, which makes it a natural morning stop on the return leg rather than the outbound one.',
        ],
      },
    ],
    facts: [
      { label: 'Harihar to Hampi', value: '140 km, about 3 hours' },
      { label: 'Bengaluru to Harihar', value: '270 km, 4 to 5 hours' },
      { label: 'Parking', value: 'Free, on site, CCTV' },
      { label: 'Suggested departure for sunrise', value: '5:00 AM' },
    ],
    recommendedRooms: ['premium-ac-room', 'premium-room', 'double-room'],
    related: [
      { label: 'Getting here and driving routes', href: '/location' },
      { label: 'All hotels in Harihar, compared', href: '/hotels-in-harihar' },
      { label: 'Travel guides', href: '/guides' },
    ],
    faqs: [
      {
        q: 'How far is Hampi from Harihar?',
        a: 'About 140 kilometres, which is roughly three hours by road via Ranebennur and Hospet. Leaving Harihar at 5:00 AM puts you at Hampi around 8:00 AM, before the heat and the tour buses.',
      },
      {
        q: 'Is there parking for a car overnight?',
        a: 'Yes, free on-site parking for cars and two-wheelers, monitored by CCTV. There is no charge and no need to reserve a space.',
      },
    ],
  },
]

export const LANDING_BY_SLUG = Object.fromEntries(
  LANDING_PAGES.map((p) => [p.slug, p]),
) as Record<string, LandingPage>
