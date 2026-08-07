import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'
import { Picture } from '@/components/media/picture'
import { Reveal } from '@/components/motion/reveal'
import { ClosingCta } from '@/components/sections/closing-cta'
import { TrustStrip } from '@/components/sections/trust-strip'
import { Prose } from '@/components/ui/prose'
import { Section } from '@/components/ui/section'
import { HOTEL } from '@/content/hotel'
import { breadcrumbNode, jsonLdGraph } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
]

export const metadata: Metadata = pageMetadata({
  title: 'About Cibara Comforts',
  description: `An owner-run lodge in Harihar since ${HOTEL.foundedYear}. Fifteen thousand guests, 4.6 stars across ${HOTEL.rating.count} Google reviews, and a plain account of what we do and do not offer.`,
  path: '/about',
})

const BODY = `
## Why the building looks like this

The floors are hand-laid cement tile in ochre and cream, the pattern you will find in half the older buildings in this district. The discs on the walls are cane, woven locally. The green on the wainscot is the green that goes on public buildings all over north Karnataka, and we used it for exactly that reason.

None of that was a design decision made to look expensive. It was the cheapest way to make rooms that did not feel like a corridor of identical boxes, and it happens to be the thing guests photograph.

## What we spend money on

Mattresses, linen, water heating and the generator. In that order.

A guest arriving off a delayed train at two in the morning does not care about the lobby. They care that the bed is firm, the sheets are clean, the shower is hot and the fan keeps running when the power goes. Those four things are where the money goes, and everything else is downstream of them.

## What we do not have

- No restaurant. Room service brings tea, coffee and simple food, and there are several places to eat within a five minute walk.
- No lift. The building is two floors. Tell us at booking if stairs are a problem and we will put you on the ground floor.
- No swimming pool, no gym, no spa, and no plans for any of them.
- No air conditioning outside the Premium AC room. The other rooms have ceiling fans and cross ventilation, which is honest rather than ideal in April.

We would rather list these plainly than have you discover them at check-in.

## Direct booking, and why we push it

Booking.com, MakeMyTrip and Goibibo charge a commission of roughly fifteen to twenty percent. That comes out of the room rate, which means a listing price has to carry it.

When you book direct, on the phone or on WhatsApp, that money is not in the transaction at all. Some of it comes back to you as a lower rate and some of it stays here and pays for the mattresses. We are not going to pretend this is a loyalty programme. It is simply cheaper for both of us.

## Fifteen thousand guests

Since 2016 a bit over fifteen thousand people have slept here. Railway staff, medical reps, wedding families, temple visitors, students, cyclists, a fair number of people driving to Hampi, and one film crew.

A good proportion of them come back. On a property at this price point, in a town this size, that is the only metric that has ever meant anything to us.
`

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdGraph(breadcrumbNode(CRUMBS)) }}
      />

      <PageHeader
        crumbs={CRUMBS}
        eyebrow={`Owner-run since ${HOTEL.foundedYear}`}
        titleLines={['A small lodge', 'in a working town']}
        lead="Cibara Comforts is a nineteen-room property between Harihar railway station and the KSRTC bus stand. It is run by the family that owns it, which is the reason most of the following is written in the first person plural rather than by an agency."
      />

      <TrustStrip />

      <Section tone="paper">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-20">
            <Prose source={BODY} />

            <Reveal delay={80} className="lg:sticky lg:top-28 lg:self-start">
              <Picture
                id="hero1"
                alt="A Premium room at Cibara Comforts showing the hand-laid cement floor tile, cane wall discs and green wainscot"
                sizes="(min-width: 1024px) 42vw, 100vw"
                ratio="4 / 5"
                className="rounded-[var(--radius-image)] shadow-[var(--shadow-card)]"
              />
              <figcaption className="mt-4 flex items-start gap-3 text-caption text-ink-mute">
                <span aria-hidden className="mt-2 h-px w-6 shrink-0 bg-brass" />
                The tile, the cane and the green. None of it was chosen to look expensive, which is
                probably why it does.
              </figcaption>
            </Reveal>
          </div>
        </div>
      </Section>

      <ClosingCta />
    </>
  )
}
