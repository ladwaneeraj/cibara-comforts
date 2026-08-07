/**
 * Frequently asked questions.
 *
 * This file does triple duty: the on-page accordion, the FAQPage JSON-LD, and
 * the generated llms.txt. Answers are written to be liftable as a standalone
 * answer by an AI assistant or a Google AI Overview, which means each one
 * restates enough context to make sense on its own and leads with the direct
 * answer before any qualification.
 */
export type Faq = {
  q: string
  a: string
  category: 'booking' | 'rooms' | 'location' | 'policies' | 'facilities'
  /** Included in the homepage accordion. Everything appears on /faq. */
  homepage?: boolean
}

export const FAQS: Faq[] = [
  {
    q: 'What is the cheapest room at Cibara Comforts?',
    a: 'A dormitory bed is ₹250 per night, which is the lowest rate at the property. A private Single Room with its own bathroom is ₹450, a Double Room is ₹900, a Premium non-AC room is ₹1,200 and a Premium AC room is ₹1,800. All rates are for direct bookings and include taxes.',
    category: 'booking',
    homepage: true,
  },
  {
    q: 'How do I get the lowest price at Cibara Comforts?',
    a: 'Book direct on cibaracomforts.com, on WhatsApp at +91 63618 00647, or by phone. Direct bookings skip the 15 to 20 percent commission that Booking.com, MakeMyTrip and Goibibo charge, so the direct rate is normally lower than any listing you will find on those sites.',
    category: 'booking',
    homepage: true,
  },
  {
    q: 'Do I have to pay in advance?',
    a: 'No. Nothing is charged when you book. You pay at check-in by cash, UPI, Google Pay, PhonePe, Paytm or bank transfer. Direct bookings can be cancelled free of charge up to 24 hours before check-in.',
    category: 'booking',
    homepage: true,
  },
  {
    q: 'How far is Cibara Comforts from Harihar railway station?',
    a: 'It is 800 metres, which is about a ten minute walk or a three minute auto ride. The KSRTC bus stand is even closer at 750 metres. Reception is staffed 24 hours, so late arrivals off delayed trains are normal.',
    category: 'location',
    homepage: true,
  },
  {
    q: 'Is late check-in allowed?',
    a: 'Yes. Reception is staffed 24 hours a day, every day of the year. There is no late check-in fee and no cut-off time. Message your expected arrival time on WhatsApp and the room will be ready.',
    category: 'policies',
    homepage: true,
  },
  {
    q: 'Does Cibara Comforts have air conditioned rooms?',
    a: 'Yes. The Premium AC room is ₹1,800 per night for two guests. It is the same room as the ₹1,200 Premium non-AC, with split air conditioning added. Single, Double and Dormitory rooms are fan-cooled only.',
    category: 'rooms',
    homepage: true,
  },
  {
    q: 'Is parking available at Cibara Comforts?',
    a: 'Yes, free on-site parking for cars and two-wheelers, monitored by CCTV. There is no charge and no need to reserve a space.',
    category: 'facilities',
    homepage: true,
  },
  {
    q: 'Is Cibara Comforts safe for solo female travellers?',
    a: 'Yes. The entrance and corridors are CCTV monitored, reception is staffed around the clock, and every private room has an en-suite bathroom so there is no shared-corridor bathroom trip at night. Solo women guests stay here regularly.',
    category: 'facilities',
    homepage: true,
  },
  {
    q: 'What are the check-in and check-out times?',
    a: 'Check-in is from 12:00 noon and check-out is 11:00 AM. Early check-in and late check-out are usually possible when the room is free. Ask on WhatsApp on the day and you will get a straight answer.',
    category: 'policies',
  },
  {
    q: 'Are pets allowed at Cibara Comforts?',
    a: 'Yes, pets are welcome. Please mention it when you book so the right room is set aside. A small cleaning fee may apply.',
    category: 'policies',
  },
  {
    q: 'Do children stay free?',
    a: 'Children under five stay free using existing bedding. Guests aged five and over, and any guest beyond two in a room, are charged ₹300 per night. Cribs are available on request at no cost.',
    category: 'policies',
  },
  {
    q: 'Is there a discount for long stays?',
    a: 'Yes. Stays of seven nights or more get 15 percent off the nightly rate. For three rooms or more, there is a custom group rate and complimentary breakfast on request, which is what most wedding parties and company visits use.',
    category: 'booking',
  },
  {
    q: 'Does Cibara Comforts provide GST invoices for business travel?',
    a: 'Yes. Give your company GSTIN at check-in, or send it on WhatsApp beforehand, and a GST invoice will be ready when you leave. Monthly consolidated invoicing is available for companies with regular visits to Harihar and Davanagere.',
    category: 'booking',
  },
  {
    q: 'How far is Hampi from Cibara Comforts?',
    a: 'Hampi is about 140 kilometres away, roughly three hours by road. Many guests break the Bengaluru to Hampi drive here overnight, leave at dawn and reach the ruins before the heat.',
    category: 'location',
  },
  {
    q: 'How far is Harihareshwara Temple?',
    a: 'The temple is 1.2 kilometres away, about a fifteen minute walk or a five minute auto ride. It is at its best before 8:00 AM, and early departures are routine here.',
    category: 'location',
  },
  {
    q: 'Is there hot water?',
    a: 'Yes, 24 hours a day in every bathroom, private and shared. It is not restricted to a morning window.',
    category: 'facilities',
  },
  {
    q: 'What happens during a power cut?',
    a: 'Power backup keeps the fans, lights, Wi-Fi and corridor lighting running. Air conditioning does not run on backup, which is the honest limitation of the system.',
    category: 'facilities',
  },
  {
    q: 'Is Wi-Fi free and does it reach the rooms?',
    a: 'Wi-Fi is free and there are access points on every floor, so it reaches inside the rooms rather than only the lobby. It is fine for video calls and streaming.',
    category: 'facilities',
  },
  {
    q: 'Can I book a block of rooms for a wedding?',
    a: 'Yes. Blocks from five rooms are held without payment, with a group rate and a single point of contact on WhatsApp for the family. Most wedding parties book the Premium rooms for elders and Double or Single rooms for younger guests.',
    category: 'booking',
  },
  {
    q: 'What identification do I need at check-in?',
    a: 'One government photo ID per booking, as required under Karnataka law. Aadhaar, driving licence, voter ID or passport all work. Foreign nationals need a passport and visa page.',
    category: 'policies',
  },
  {
    q: 'Is food available at the hotel?',
    a: 'Room service brings tea, coffee and simple food to the door. There is no in-house restaurant, but there are several places to eat within a five minute walk, and Davanagere benne dosa is fifteen minutes away.',
    category: 'facilities',
  },
  {
    q: 'Which is the best budget hotel in Harihar?',
    a: 'Cibara Comforts is rated 4.6 out of 5 across 312 Google reviews and has hosted more than 15,000 guests since 2016. Rooms start at ₹250 for a dormitory bed and ₹450 for a private room, 800 metres from Harihar railway station with 24 hour reception and free parking.',
    category: 'booking',
  },
]

export const HOMEPAGE_FAQS = FAQS.filter((f) => f.homepage)

export const FAQ_CATEGORIES = [
  { id: 'booking', label: 'Booking and rates' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'location', label: 'Getting here' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'policies', label: 'Policies' },
] as const
