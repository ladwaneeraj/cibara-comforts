# Architecture

Why the site is built the way it is. Descriptions of what the code does live in
the code; this document covers the decisions and their trade-offs.

---

## 1. The positioning bet

Cibara Comforts charges ₹250 to ₹1,800 a night. The brief asked for a site that
feels like a ₹20,000-a-night boutique hotel.

Taken literally, that is a trap. A ₹450 lodge that presents itself as a luxury
hotel gets found out in the first photograph, and the gap between promise and
reality destroys exactly the trust the site exists to build. Guests do not
punish a budget property for being budget. They punish it for lying.

So the site does something different. It applies the *production values* of an
expensive site (typography, spacing, restraint, photography treatment, motion
discipline) to *honest content* about an affordable one. The homepage says "We
are not a luxury hotel. We are a very good one." The Premium non-AC room page
says out loud that you will miss the air conditioning in April. The gallery says
that if a floor tile is chipped in a picture, it is chipped in the room.

Refusing to oversell is the one premium signal a competitor cannot copy by
hiring a better photographer. It is also, on the evidence, what actually
converts in this segment: the visitor's real question is not "is this
luxurious" but "will this be as described".

### The palette follows from that

Every brand colour is sampled from the building rather than invented:

| Token | Source |
|---|---|
| `--color-forest` `#23392c` | The wainscot in the Premium rooms |
| `--color-brass` `#a8845a` | The cane wall discs and the lamp glow |
| `--color-paper-2` `#f4efe6` | The cream half of the floor tile |
| `--color-terracotta` `#9c4b32` | The kantha print on the cushions |

A colder, more fashionable Nordic-minimal palette would have looked more like a
design award entry and less like the hotel. The photographs would have fought
it on every page.

---

## 2. Static export, and what it costs

The site deploys to GitHub Pages, which serves files and nothing else. That
removes Server Actions, ISR, PPR, middleware, route handlers and the
`next/image` optimizer. Each has a replacement:

| Unavailable | Replacement | Where |
|---|---|---|
| `next/image` optimizer | Build-time pipeline + a plain `<picture>` | `scripts/optimize-images.mjs`, `components/media/picture.tsx` |
| Server Actions | WhatsApp deep links | `lib/booking.ts` |
| Route handlers | Nothing needed; the site has no API | — |
| Middleware headers | Meta CSP, plus CDN rules | `docs/DEPLOYMENT.md` |
| ISR | Not needed; content is a build-time constant | — |

The honest summary: for a property with no live inventory system and content
that changes a few times a year, none of these are a real loss. The one place
it bites is HTTP security headers, which GitHub Pages cannot send. See
`docs/DEPLOYMENT.md` for the Cloudflare workaround.

Moving to Vercel or Cloudflare Workers later is mostly deleting `output:
'export'` and `images.unoptimized` from `next.config.ts`.

---

## 3. The image pipeline

`scripts/optimize-images.mjs` does at build time what the `next/image`
optimizer would have done at request time.

**Input:** `assets/source/*.{jpg,png}`
**Output:** `public/media/<id>/<width>.{avif,webp}`, a JPEG fallback, and
`src/content/generated/media.ts` carrying dimensions, a blur placeholder and
the average colour.

Three decisions worth knowing about:

**A shared colour grade is applied to every image.** The property photographs
were shot across several sessions under mixed tungsten and daylight, which left
a magenta cast on the floor tiles and pushed the textile reds past what reads as
premium on screen. The grade pulls saturation to 0.85, lifts the shadows and
warms the whites, so images from four different shoots read as one set. It is
applied before resizing, so it is resolution independent. Changing it is one
function.

**Crops are not baked into the files.** Derivatives are full-frame at each
width; art direction happens in CSS via `object-position` and a `ratio` prop on
`<Picture>`. This means changing a crop is a one-line edit with no reprocessing,
and it avoids emitting a separate file set per aspect ratio.

**The blur placeholder is CSS, not JavaScript.** A 24px WebP is inlined as a
`background-image` with the average colour underneath. Because it is pure CSS
it works before hydration and on a failed JS load, which is precisely when a
guest on a slow connection most needs it. The trade-off is no fade-in on
decode, which would require JavaScript to detect. Not worth it.

**Derivatives are committed to the repository.** They are deterministic, they
change rarely, and committing them keeps CI down to a few seconds. The
`.stamp` files make regeneration incremental.

---

## 4. Motion

The rule applied throughout: *if CSS can do it, JavaScript must not*.

| Effect | Implementation | JS cost |
|---|---|---|
| Section reveals | `animation-timeline: view()`, with a single shared IntersectionObserver as fallback | ~400 bytes, inline |
| Heading line reveal | CSS keyframe with a staggered `animation-delay` | Zero |
| Hero Ken Burns | CSS keyframe, 18s, 1.06× | Zero |
| Magnetic buttons | Two CSS custom properties, one pointermove handler | ~30 lines |
| Page transitions | Native View Transitions API | Zero |
| Smooth scroll | Lenis, dynamically imported, desktop only | Deferred |
| Accordion, dialog | Radix, and the dialog is lazy-loaded | Deferred |

Three of these are worth explaining.

**`Reveal` is a server component, and that was the single biggest performance
decision on the site.** It started as a client component with an
IntersectionObserver. Because it wraps most sections, marking it `'use client'`
forced React to serialise every wrapped subtree into the RSC flight payload:
137 KB of the homepage's 283 KB, duplicating content already in the HTML and
paid for again in hydration. Making it a server component with CSS-driven
animation cut the LCP element render delay from 1,272 ms to 231 ms on throttled
mobile. If you are ever tempted to add `'use client'` to a wrapper component,
this is the cautionary tale.

**Magnetic hover does not use a spring library.** The first version used
Motion, which cost roughly 35 KB shipped to every visitor to produce an
eight-pixel translation that only mouse users ever see. The replacement writes
two CSS custom properties and lets a CSS transition do the easing. The `motion`
dependency was removed entirely.

**GSAP was specified in the brief and is not installed.** Everything the design
needs is covered by CSS scroll-driven animations and Radix. Adding GSAP would
have been about 70 KB for capability already present. If a future animation
genuinely needs a timeline (a scroll-scrubbed sequence, morphing SVG), that is
the moment to add it, not before.

**Lenis is desktop only.** Mobile browsers already have tuned,
GPU-composited momentum scrolling. Replacing it with a JavaScript rAF loop makes
scrolling feel heavier, breaks pull-to-refresh and URL-bar collapse, and adds
main-thread work on exactly the hardware that can least afford it. Lenis on
mobile is a common and expensive mistake.

Everything is gated on `prefers-reduced-motion`, and the global rule in
`globals.css` collapses any animation that slipped through.

---

## 5. Booking

There is no availability calendar because there is no availability system.

The property has no channel manager and no PMS feed. A widget showing green
"available" cells would be a fiction, and the fastest way to lose a guest is to
have them arrive at a room that was never free. So the flow collects the three
facts a human at reception needs (dates, guests, room), formats them into a
WhatsApp message and hands off. Reception replies in minutes, which in practice
beats most OTA confirmations.

Consequences of that choice, all of them deliberate:

- No form backend to secure, no spam endpoint, no personal data at rest.
- The guest ends up in a thread with a written record on both sides.
- The copy says "we will confirm in minutes" rather than showing a fake tick.

`lib/booking.ts` is the seam. When a real availability API exists, `buildEnquiry`
is the only thing that changes; every call site keeps the same shape.

Native `<input type="date">` rather than a React date picker. An accessible
picker costs 25 to 40 KB and still loses to the OS picker on a phone, which is
where nearly all of this traffic is. The native control is keyboard accessible,
screen-reader labelled and localised for free.

---

## 6. Structured data

`lib/schema.ts` emits one connected `@graph` per page rather than a stack of
independent blocks. The `@id` cross-references are what let Google and the
LLM-based search engines resolve "the hotel", "its rooms", "its reviews" and
"the temple nearby" as one entity cluster instead of four unrelated snippets.
That linkage is most of what "knowledge graph signals" means in practice.

Node types in use: `Hotel` / `LodgingBusiness` / `LocalBusiness`, `HotelRoom`
with `Offer` and `ReserveAction`, `AggregateRating`, `Review` (gated),
`FAQPage`, `BreadcrumbList`, `Article`, `ImageGallery`, `TouristAttraction`,
`WebSite`.

**`Review` nodes are gated behind a `verified` flag** in
`src/content/reviews.ts` and there are currently none. The 4.6 aggregate is
real and is emitted; individual reviews are not, because they have not been
pasted in yet. Do not remove that gate.

`FAQPage` is emitted in full only from `/faq`. Pages showing a subset render
the questions as normal markup without duplicating the structured data, which
avoids the duplicate-markup warning in Search Console.

---

## 7. Content architecture

Every page on the site is generated from data in `src/content/`. There are five
room pages, four landing pages and four guides, and none of them has a
hand-written page component. Adding an object to the right file creates the
page, its metadata, its structured data, its internal links and its sitemap
entry.

This is not abstraction for its own sake. It is the only way NAP consistency
survives contact with a real business: when the phone number changes, it
changes in one place and propagates to the footer, the JSON-LD, the WhatsApp
links, `llms.txt` and every page's copy simultaneously. Inconsistent NAP across
citations is one of the largest and most common local-SEO own goals.

### Why guides are typed strings rather than MDX

MDX would mean either a second registry file per article to feed the index
page, or a frontmatter parser, plus a loader in the build. For a handful of
guides written by one person, a typed string in a typed file gives a single
source of truth, full type safety, no build plugins and no dependency to keep
current. The Markdown subset is documented in `components/ui/prose.tsx` and
covers headings, lists, quotes, links, bold and code.

If the guide count reaches a point where non-technical editing matters, the
`Prose` renderer is the only thing that has to be replaced. See
`docs/LAUNCH.md` for CMS options.

---

## 8. Design system

Tokens live in `src/app/globals.css` under `@theme`. Components reference
tokens only, never raw values, which is what makes the dark theme almost free.

**Type.** Fraunces (variable serif) for display, Inter for everything else.
Inter over a more fashionable grotesque because a large share of this
property's traffic is on inexpensive Android phones, where Inter's larger
x-height and open apertures measurably help. Both are self-hosted from files
committed to the repository, so `next build` never depends on a network call to
Google.

The scale is fluid `clamp()` throughout, with minimums tuned for a 360px
Android viewport rather than a 375px iPhone, because that is the modal device
here.

**Spacing.** One token, `--spacing-section`, drives vertical rhythm on every
section. Consistent rhythm is most of what reads as expensive layout;
inconsistent rhythm is most of what reads as a template.

**Radii.** Photography stays nearly square at 3px. Containers get 16 to 24px.
Rounded photographs read as a stock template; rounded containers read as
considered.

**Shadows** are warm-tinted rather than neutral grey. A grey shadow on a warm
paper background is one of the most common tells of an unconsidered theme.

**Dark mode** is not an inverted light theme. It is the property at night: the
forest green that is on the walls, warm brass lamplight, cream linen. That is
the only reason it is here at all; a generic grey dark theme would have been a
maintenance cost with no brand return.

---

## 9. Accessibility

Targeting WCAG 2.2 AA, verified by `npm run audit` and Lighthouse (100 on every
route).

- Every colour pair was computed rather than eyeballed. `--color-ink-mute` was
  darkened from `#7b756a` (4.34:1, fails) to `#6b6559` (5.5:1). The WhatsApp
  button uses `#0F7D42`, not the brand `#25D366`, which is 1.7:1 against white
  and fails badly at any size.
- Touch targets are 44px minimum, set by size rather than by font size.
- Pinch zoom is never disabled.
- Focus rings are branded but never removed.
- The mobile dock reserves its own height so it cannot obscure the footer.
- Smooth scroll moves focus as well as scroll position, so skip links work.
- The gallery viewer is keyboard navigable with arrow keys and escape.
- Filters keep every item in the DOM and hide non-matching ones, so content is
  crawlable and announceable regardless of filter state.

The known limitation, stated on `/policies` rather than hidden: the building
is two floors with no lift.

---

## 10. Analytics, and the honest trade-off

Google Analytics, Clarity and the Meta Pixel together add roughly 150 to 250 KB
of third-party JavaScript and reliably cost 15 to 30 Lighthouse performance
points on a mid-range Android. You cannot have both a perfect performance score
and three tag managers loading eagerly. Anyone who tells you otherwise is
measuring a page with the tags disabled.

The compromise in `components/analytics/deferred-analytics.tsx`: nothing loads
during the critical path. Tags boot on the first real interaction, or when the
browser goes idle, whichever comes first. Bounced visitors cost nothing and
were never useful data anyway; engaged sessions are still tracked; Core Web
Vitals are measured on an unloaded page.

Every tag is behind an environment variable. Leave one unset and it is never
loaded at all.

---

## 11. Measured results

Lighthouse against the static export served with gzip, which is what GitHub
Pages does.

| | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Desktop | **100** | **100** | **100** | **100** |
| Mobile | 84–92 | **100** | **100** | **100** |

Core Web Vitals: CLS **0**, TBT 140–220 ms, FCP 1.2–1.4 s, LCP 3.0–3.9 s on
Lighthouse's simulated slow 4G with 4× CPU throttling.

The mobile performance number is the one weak spot and it is worth being
precise about why. It is not network: the document is 49 KB gzipped, the hero
image is 39 KB, and every request completes inside 130 ms. It is CPU. React
hydration accounts for roughly 800 ms of script evaluation under a 4× throttle,
and Lighthouse's simulated-throttling model amplifies that into the LCP figure.

What would move it, in order of effect:

1. **Fewer client components on the homepage.** The booking bar, header and FAQ
   accordion all hydrate on load. Making the booking bar a progressively
   enhanced form (a plain `<form>` that works without JS, upgraded on
   interaction) is the largest single win available.
2. **Dropping React for the marketing pages.** Astro with islands would remove
   the hydration cost entirely and would plausibly reach 100 on mobile. It
   would also mean rewriting the interactive components. This is a real option
   and an honest one, not a criticism of the current build.
3. **Deferring the FAQ accordion below the fold** with `next/dynamic`.

None of these are free, and the field experience is already good: CLS is zero,
the page is readable at 1.2 s, and every interactive element works. The scores
above are lab numbers under deliberately pessimistic conditions.
