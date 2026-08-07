import type { MediaId } from './generated/media'
import type { GuideMarkId } from './guide-marks'

/**
 * Travel guides.
 *
 * The topical-authority layer. Google and the LLM-based search engines both
 * reward a site that demonstrably knows its subject, and for a small hotel the
 * only subject it can credibly own is its own town. These guides are written
 * to be genuinely the best available answer to their question, because that is
 * the only version of content marketing that still works.
 *
 * Each links back to the relevant landing page and room, which is what turns
 * informational traffic into booking traffic.
 *
 * Body format is the Markdown subset documented in components/ui/prose.tsx.
 */
export type Guide = {
  slug: string
  title: string
  /** Page <title>. Shorter than the display title. */
  seoTitle: string
  metaDescription: string
  /** Display heading, split into masked lines. */
  headingLines: string[]
  standfirst: string
  /**
   * The drawn cover mark. See content/guide-marks.ts: the guides are about the
   * temple, the road and the town, and there is no photograph of any of them,
   * so a room photo here would be telling the reader one thing and showing
   * them another.
   */
  mark: GuideMarkId
  /**
   * A real photograph of the guide's actual subject, once one exists. Setting
   * this overrides the drawn mark everywhere: the cover, the card and the
   * OpenGraph image.
   */
  photo?: MediaId
  photoAlt?: string
  published: string
  updated?: string
  readingMinutes: number
  tags: string[]
  body: string
}

export const GUIDES: Guide[] = [
  {
    slug: 'bengaluru-to-hampi-road-trip',
    title: 'Driving Bengaluru to Hampi: where to break the journey',
    seoTitle: 'Bengaluru to Hampi by Road: Where to Stop Overnight',
    metaDescription:
      'Driving Bengaluru to Hampi: the route, realistic timings, where to break the journey overnight, and why arriving at the ruins at 8 AM beats 2 PM.',
    headingLines: ['Bengaluru to Hampi,', 'the sensible way'],
    standfirst:
      'Seven hours in one push puts you at the ruins in the worst heat of the day. Splitting the drive costs one night and changes the whole trip.',
    mark: 'road',
    published: '2026-06-02',
    readingMinutes: 6,
    tags: ['Hampi', 'Road trips', 'Karnataka'],
    body: `
Most people drive Bengaluru to Hampi in a single day, arrive somewhere between one and three in the afternoon, and spend their first hours in Hampi doing the two things Hampi is worst for: standing in direct sun on bare granite, and queuing behind tour groups.

It is an avoidable mistake. Here is the alternative.

## The route and the real timings

The usual route is NH-48 to Chitradurga, then on through Harihar and Ranebennur, then across to Hospet and Hampi. Around 340 kilometres in total.

Google will tell you six hours. Plan for seven and a half. That is the honest number once you include a breakfast stop, a toilet stop, at least one stretch of roadworks, and the last thirty kilometres into Hampi which are slower than the map suggests.

- **Bengaluru to Chitradurga:** about 200 km, three hours
- **Chitradurga to Harihar:** about 70 km, ninety minutes
- **Harihar to Hospet:** about 110 km, two hours
- **Hospet to Hampi:** about 13 km, twenty-five minutes

## Why the afternoon arrival is the problem

Hampi is a ruined city spread over roughly 26 square kilometres of granite boulders and open ground. There is almost no shade. Between eleven and four, from February onwards, walking it is genuinely unpleasant, and the light is flat and white, which is why so many Hampi photographs look worse than the place does.

The site is also busiest in the early afternoon, because that is when the day-trip buses from Hospet arrive.

> Every worthwhile hour in Hampi is before ten in the morning or after four in the afternoon. Arriving at two spends the first day acquiring the worst of both.

## Where to break it

You want a stop between four and five hours in, so that the next morning's drive is short. That puts Harihar, Davanagere or Ranebennur in range.

**Harihar** is 270 km from Bengaluru and 140 km from Hampi, which is close to the ideal split. It is a small town directly on the highway corridor with a decent cluster of budget lodges near the railway station, and it has a genuine Hoysala temple worth an hour if you are up early.

**Davanagere** is 15 km further and larger, with more hotel choice at higher prices. Sensible if you want a business hotel. Its other claim is the benne dosa, which deserves its reputation.

**Ranebennur** is closer to Hampi but has less accommodation. It works if you leave Bengaluru late.

## The morning that makes it worth it

Leave your stop at five. From Harihar you will be parking at Hampi around eight, which is close to the best possible time to arrive.

1. Start at Virupaksha Temple while the bazaar is still waking up.
2. Walk the Hemakuta Hill group as the light comes across the boulders. This is the hour photographers come for.
3. Do Vittala Temple and the stone chariot before ten, when the coaches arrive.
4. Break between noon and four. Eat, sleep, sit somewhere with a fan.
5. Come back out at four for the Royal Enclosure, the Queen's Bath and Matanga Hill for sunset.

That is a full and comfortable day. Attempting the same schedule after a seven-hour drive is not.

## Practical notes for the stop

- Book somewhere with **free, secure parking**. On a road trip this matters more than the room does.
- Look for **24 hour reception**, because you will not arrive when you planned to.
- Check that **hot water runs at 5 AM**, not only during a morning window. Plenty of budget properties heat water on a timer.
- Do not pre-pay. Somewhere with free cancellation until the day before costs you nothing if you make better time than expected.

---

If Harihar is where you decide to stop, [we are 800 metres from the railway station](/hotels-near-harihar-railway-station) with free parking, a generator, and somebody at the desk whatever time you roll in. [Rooms and rates are here](/rooms), and there is [more on the Harihar stop specifically](/stay-near-hampi).
`,
  },

  {
    slug: 'harihareshwara-temple-guide',
    title: 'Harihareshwara Temple: what to see and when to go',
    seoTitle: 'Harihareshwara Temple, Harihar: A Visitor Guide',
    metaDescription:
      'Harihareshwara Temple, Harihar: the Hoysala stonework, the split Hari-Hara image, timings, what to wear, and why the hour before 8 AM is the one to take.',
    headingLines: ['Harihareshwara Temple,', 'before the day starts'],
    standfirst:
      'A 12th century Hoysala temple to a god who is half Vishnu and half Shiva, in a town almost nobody stops in. Go at seven in the morning.',
    mark: 'temple',
    published: '2026-05-18',
    readingMinutes: 5,
    tags: ['Temples', 'Harihar', 'Hoysala'],
    body: `
Harihar is named after its temple, which is a reasonable indication of how central the thing is to the town. Harihareshwara Temple sits near the Tungabhadra, about a kilometre from the railway station, and it is a genuine Hoysala-period building rather than a modern reconstruction with an old name.

## The god the temple is for

Harihara is the composite form of Vishnu (Hari) and Shiva (Hara), a single deity split down the vertical axis. The central image here follows that exactly: one half carries Vishnu's attributes, the other Shiva's, divided down the middle of the body.

It is worth standing in front of it for a minute rather than photographing it and moving on. The theological argument the sculpture is making, that the two are one, was a live and contested one when this was carved.

## The stonework

The temple was built in the early 13th century under the Hoysalas, and it has the characteristics that tradition is known for: soapstone rather than granite, which allowed much finer carving, a star-shaped plan, and heavily worked outer walls.

- Look at the **wall panels** on the outer circuit, and the depth of undercutting on the figures.
- The **lathe-turned pillars** inside the hall are a Hoysala signature. They were shaped on a rotating lathe, which is a remarkable thing to have done at this scale in stone.
- Some sections show **later repair and rebuilding**, particularly after the Delhi Sultanate campaigns. The joins are visible if you look for them, and they are part of the building's history rather than a defect.

## When to go

Before eight in the morning. This is not a preference, it is the whole recommendation.

The temple is active rather than a monument, so it fills up through the day, especially at weekends and on festival days. In the early morning the light is low and comes in sideways across the carved walls, which is when the undercutting reads properly. It is also, from February onwards, the only part of the day when standing on the stone is comfortable.

> An hour at Harihareshwara at seven in the morning is worth three hours there at midday, and it is a better hour than most of what people drive to Hampi for.

## Practicalities

- **Timings.** Generally open early morning to around midday, and again in the evening. Check locally, because they shift with the festival calendar.
- **Dress.** Cover shoulders and knees. This is a working temple with a regular congregation, not a tourist site.
- **Shoes.** Off before you enter, as everywhere. There is a place to leave them.
- **Photography.** Fine outside. Ask before photographing inside the sanctum, and accept no for an answer.
- **Time needed.** Forty minutes to see it. An hour and a half if you actually look at the wall panels.

## While you are here

The **Tungabhadra ghats** are about ten minutes further on foot. Quiet steps down to the water, and a good place to sit at either end of the day.

If you have a car and a morning, **Chitradurga Fort** is seventy kilometres south, and the seven concentric walls are worth the drive.

---

We are [fifteen minutes from the temple on foot](/hotels-near-harihareshwara-temple), and leaving at half past five to be there for the morning is completely routine here. Tell the night desk the evening before. [Rooms start at ₹250](/rooms).
`,
  },

  {
    slug: 'things-to-do-in-harihar',
    title: 'Things to do in Harihar, and how long each takes',
    seoTitle: 'Things to Do in Harihar, Karnataka: An Honest List',
    metaDescription:
      'What there is to do in Harihar with realistic timings: Harihareshwara Temple, the Tungabhadra ghats, Davanagere benne dosa, Chitradurga and Hampi.',
    headingLines: ['What there is to do', 'in Harihar'],
    standfirst:
      'A short list, written by people who live here. Harihar is a one-night town and pretending otherwise helps nobody.',
    mark: 'town',
    published: '2026-04-27',
    readingMinutes: 5,
    tags: ['Harihar', 'Karnataka', 'Day trips'],
    body: `
Harihar is a working town of about a hundred thousand people on the Bengaluru to Hubballi line. It is not a destination and we are not going to write you a listicle pretending it is one.

What it is, is a comfortable and cheap place to spend a night, with two or three genuinely good things to do in a morning and some very good day trips within two hours. Here is the honest version.

## In Harihar itself

### Harihareshwara Temple — one hour

The 13th century Hoysala temple the town is named for, with a central image split between Vishnu and Shiva. Go before eight in the morning, both for the light on the carved walls and because it gets busy. Forty minutes to see, ninety if you look properly. There is [a longer guide here](/guides/harihareshwara-temple-guide).

### The Tungabhadra ghats — forty minutes

Steps down to the river, about two kilometres from the station. Almost nobody who is not local goes. Best at sunset, when the light comes down the water. Bring nothing, buy tea from the stall at the top on the way back.

### The market streets — an hour

The area between the bus stand and the temple is an ordinary South Indian small-town market and it is worth walking without a plan. Produce, steel vessels, tailors, flowers by the kilo. Mornings.

## Within an hour

### Davanagere, for the benne dosa — half a day

Fifteen kilometres and twenty-five minutes away. Davanagere benne dosa is a genuine regional speciality rather than a manufactured one: a thick, soft dosa cooked in an unreasonable quantity of white butter, served with a coarse potato palya and a chutney with roasted gram in it.

Go to one of the old-established places rather than a restaurant. Eat it at seven in the morning or seven in the evening, standing up, and do not ask how much butter went into it.

## Day trips worth the drive

### Chitradurga Fort — a full day

Seventy kilometres south, about ninety minutes. Seven concentric walls climbing a granite hill, with a water-harvesting system that still works. It is a serious fort and a serious walk. Start early, take water, allow four hours on site.

### Hampi — a long day, better as an overnight

A hundred and forty kilometres, about three hours. Doable as a very long day trip from Harihar if you leave at five and come back after dark, but Hampi rewards two days and most people should give it two. If you are driving through, [there is a case for stopping here on the way](/stay-near-hampi) rather than treating it as a return trip.

### Badami, Aihole and Pattadakal — an overnight

Around two hundred kilometres north. The Chalukyan cave temples at Badami are, for many people, the best thing in northern Karnataka. Too far for a day from Harihar. Worth building a night around.

---

## A realistic one-night itinerary

1. **Evening arrival.** Walk to the ghats if there is light left. Eat near the bus stand.
2. **6:30 AM.** Walk to Harihareshwara Temple. An hour there.
3. **8:00 AM.** Back through the market. Breakfast.
4. **9:30 AM.** Either drive to Davanagere for the dosa, or get on the road to Hampi or Chitradurga.

That is Harihar honestly done. If somebody has told you it needs three days, they were selling you something.

---

We are between the railway station and the bus stand, which puts all of the above within a fifteen minute walk or a short drive. [Rooms from ₹250](/rooms), and [directions are here](/location).
`,
  },

  {
    slug: 'getting-to-harihar',
    title: 'Getting to Harihar by train, bus or road',
    seoTitle: 'How to Reach Harihar, Karnataka: Trains, Buses and Roads',
    metaDescription:
      'Reaching Harihar from Bengaluru, Hubballi, Davanagere or Hampi: trains on the Bengaluru to Hubballi line, KSRTC buses, NH-48, and nearest airports.',
    headingLines: ['How to get', 'to Harihar'],
    standfirst:
      'Harihar is on the Bengaluru to Hubballi line and five minutes off NH-48, which makes it one of the easier small towns in Karnataka to reach.',
    mark: 'transport',
    published: '2026-04-10',
    readingMinutes: 4,
    tags: ['Transport', 'Harihar', 'Trains'],
    body: `
Harihar sits on the main line between Bengaluru and Hubballi and directly on the NH-48 corridor, so almost everything that goes north-west out of Bengaluru passes within a few kilometres of it.

## By train

Harihar railway station (station code HRR) is on the South Western Railway, on the Bengaluru to Hubballi route.

- **From Bengaluru (SBC / YPR):** around six hours. Several daily services, including overnight options that arrive in the small hours.
- **From Hubballi (UBL):** around two hours.
- **From Davanagere (DVG):** twenty minutes. Trains are frequent, but the bus is usually easier for such a short hop.
- **From Hospet (HPT), for Hampi:** around two and a half hours, usually with a change.

Check live times on the NTES site or a train app rather than a static timetable, because delays on this line are routine and can run to several hours.

> If you are arriving by train, the practical thing to check when booking a room is not the price. It is whether reception is staffed at three in the morning.

## By bus

The **KSRTC bus stand** in Harihar is well served, and buses on this corridor are frequent and cheap.

- **From Bengaluru:** overnight and daytime services, roughly six to seven hours. Both KSRTC and private operators run it.
- **From Davanagere:** every few minutes, twenty-five minutes.
- **From Hubballi and Shivamogga:** regular direct services.

The bus stand is 750 metres from us, which is a nine minute walk.

## By road

Harihar is a five minute detour off **NH-48**, the Bengaluru to Pune highway.

- **Bengaluru:** about 270 km, four to five hours depending on how you do around Tumakuru.
- **Hubballi:** about 120 km, two hours.
- **Hampi:** about 140 km, three hours via Ranebennur and Hospet.
- **Chitradurga:** about 70 km, ninety minutes.

The highway is good. The last few kilometres into town are ordinary small-town roads. Free parking is easy to find and most lodges here include it.

## By air

There is no airport at Harihar.

- **Hubballi (HBX):** about 125 km, two and a half hours by road. The closest.
- **Bengaluru (BLR):** about 300 km. More flights, but most people take the train onward rather than drive.
- **Belagavi (IXG):** about 230 km.

From either airport, the train or a KSRTC bus is usually cheaper and no slower than a taxi once you account for the highway.

## Getting around once you are here

Autorickshaws are plentiful and cheap. Almost nothing in the town centre is more than ₹50 away. The temple, the market, the station and the bus stand are all within a twenty minute walk of each other, so if you are travelling light you may not need one at all.

---

We are between the railway station and the KSRTC bus stand. [Step-by-step directions from each, including what to tell an auto driver, are here](/location). Reception is staffed 24 hours, so [a late arrival is the normal case](/hotels-near-harihar-railway-station), not a problem.
`,
  },
]

export const GUIDES_BY_SLUG = Object.fromEntries(GUIDES.map((g) => [g.slug, g])) as Record<
  string,
  Guide
>
