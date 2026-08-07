/**
 * Guest reviews.
 *
 * IMPORTANT, READ BEFORE LAUNCH
 * -----------------------------
 * Every entry below has `verified: false`. That flag does two things:
 *
 *   1. The testimonial section renders the quote but omits the reviewer's
 *      photograph and the "Verified Google review" chip.
 *   2. `lib/schema.ts` refuses to emit `Review` JSON-LD for it.
 *
 * Publishing invented reviews as structured data is review fraud under
 * Google's policies and a real legal exposure under the Consumer Protection
 * (E-Commerce) Rules in India. So the aggregate rating below is emitted (it is
 * a real 4.6 across 312 reviews) but individual reviews are not, until you
 * paste in genuine ones.
 *
 * TO GO LIVE: open your Google Business Profile, copy real review text and the
 * reviewer's display name, replace the entries below, and set
 * `verified: true`. Nothing else needs to change.
 */
export type Review = {
  id: string
  /** Reviewer display name exactly as it appears on the source platform. */
  author: string
  /** ISO date. */
  date: string
  rating: 1 | 2 | 3 | 4 | 5
  /** Short pull quote used in the card. */
  quote: string
  source: 'Google' | 'Booking.com' | 'MakeMyTrip' | 'Goibibo'
  /** Guest type, used for the "reviews from people like you" filter. */
  stayType: string
  /**
   * Set to true ONLY for reviews copied verbatim from a real platform.
   * Gates both the Google chip in the UI and the Review JSON-LD.
   */
  verified: boolean
}

export const REVIEWS: Review[] = [
  {
    id: 'placeholder-1',
    author: 'Replace with a real reviewer name',
    date: '2026-05-14',
    rating: 5,
    quote:
      'PLACEHOLDER. Paste a real Google review here and set verified to true. Until you do, this card renders without the verified badge and is excluded from structured data.',
    source: 'Google',
    stayType: 'Couple',
    verified: false,
  },
  {
    id: 'placeholder-2',
    author: 'Replace with a real reviewer name',
    date: '2026-04-02',
    rating: 5,
    quote:
      'PLACEHOLDER. A review from a business traveller works well in this slot. Keep the quote under about forty words so it reads cleanly on a phone.',
    source: 'Google',
    stayType: 'Business',
    verified: false,
  },
  {
    id: 'placeholder-3',
    author: 'Replace with a real reviewer name',
    date: '2026-03-21',
    rating: 4,
    quote:
      'PLACEHOLDER. Include one four-star review. A wall of nothing but five stars reads as fabricated, and a fair four-star review with a good response raises conversion rather than lowering it.',
    source: 'Google',
    stayType: 'Family',
    verified: false,
  },
]

export const VERIFIED_REVIEWS = REVIEWS.filter((r) => r.verified)

/** True when the section has real content to show. */
export const HAS_VERIFIED_REVIEWS = VERIFIED_REVIEWS.length > 0
