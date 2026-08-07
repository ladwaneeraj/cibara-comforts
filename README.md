# Cibara Comforts

The website for [cibaracomforts.com](https://www.cibaracomforts.com), a lodge in Harihar, Karnataka.

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · static export to GitHub Pages.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

To produce the exact bytes that get deployed:

```bash
npm run build        # regenerates llms.txt, then exports to out/
npx serve out        # serve the export locally
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Generates `public/llms.txt`, then a static export into `out/` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run images` | Rebuilds image derivatives from `assets/source`. Incremental |
| `npm run images:force` | Full rebuild at maximum AVIF effort. Slow. Use before a release |
| `npm run fonts` | Re-copies the webfont subsets after bumping the `@fontsource` deps |
| `npm run audit` | Accessibility, SEO and structured-data audit of `out/`. Exits non-zero on failure |
| `npm run shots` | Screenshots the built site at mobile and desktop, into `/tmp/shots` |

`audit` and `shots` need the export served first (`npx serve out`, then set `BASE`).

---

## Changing things

Almost everything you will want to edit is data, not code. All of it is in `src/content/`.

### Rates, phone numbers, policies

`src/content/hotel.ts` is the single source of truth for every business fact.
Change a rate or a phone number here and it updates the page copy, the
structured data, `llms.txt`, the footer, the WhatsApp deep links and the
sitemap. Nothing is duplicated anywhere else.

### Rooms

`src/content/rooms.ts`. Each room is one object. Adding a room automatically
creates its page, its card, its row in the comparison table, its entry in the
navigation dropdown, its structured data and its sitemap URL.

`photos: []` is a supported state and renders a designed "photograph coming"
panel rather than a broken gallery. Use it rather than a stock image.

### Guest reviews

`src/content/reviews.ts`. **Read the comment at the top of that file before
touching it.** Every entry currently has `verified: false`, which keeps it out
of the structured data. Paste real Google reviews in and flip the flag.
Publishing invented reviews as structured data is review fraud.

### Questions

`src/content/faqs.ts`. Feeds the homepage accordion, `/faq`, the FAQPage
structured data and `llms.txt`. Write answers that make sense read aloud on
their own, because a good share of them will be.

### Landing pages and guides

`src/content/landing-pages.ts` and `src/content/guides.ts`. Adding an object to
either creates the whole page, its metadata, its structured data and its
sitemap entry. Guides are written in a small Markdown subset documented in
`src/components/ui/prose.tsx`.

### Photographs

Drop a JPEG or PNG into `assets/source/`, run `npm run images`, then reference
it by filename (without the extension) from `rooms.ts` or `gallery.ts`. The
pipeline handles the colour grade, seven responsive widths, AVIF and WebP, the
blur placeholder and the OpenGraph crop.

---

## Structure

```
assets/source/          Original photographs. Input to the image pipeline
public/media/           Generated derivatives. Committed, so CI stays fast
public/og/              Generated social cards
scripts/                Image pipeline, llms.txt generator, audit, screenshots
src/
  app/                  Routes. One folder per page
    [landing]/          The four location landing pages, from content data
    rooms/[slug]/       One page per room, from content data
    guides/[slug]/      One page per guide, from content data
  components/
    booking/            The conversion layer: booking bar, dock, enquiry form
    gallery/            Filterable gallery and full-screen viewer
    layout/             Header, footer, navigation, theme toggle
    media/              The Picture component that replaces next/image
    motion/             Reveal, text reveal, magnetic hover, smooth scroll
    sections/           Homepage sections
    ui/                 Button, section shell, prose renderer, brand icons
  content/              All business data. Edit here, not in components
    generated/          Written by scripts. Do not edit
  fonts/                Committed webfont subsets, so builds need no network
  lib/                  Booking links, SEO metadata factory, JSON-LD, analytics
```

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — design system, component
  architecture, and the reasoning behind the non-obvious decisions
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — GitHub Pages, DNS, security
  headers, analytics configuration
- [`docs/LAUNCH.md`](docs/LAUNCH.md) — launch checklist, SEO plan, testing
  strategy, and what to build next

## Conventions

- **Content lives in `src/content/`.** If you are typing a price or a phone
  number into a component, stop.
- **Server components by default.** `'use client'` only where there is genuine
  interactivity. See the note at the top of `components/motion/reveal.tsx` for
  what happens when you get this wrong.
- **Every non-obvious decision carries a comment explaining the trade-off**,
  not a description of the code. If you change one of those decisions, update
  the comment.
- **`npm run audit` must pass before merging.** It catches the accessibility
  and SEO regressions a type checker cannot.
