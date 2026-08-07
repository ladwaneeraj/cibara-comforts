# Launch and roadmap

---

## Part 1: Before you go live

### Must do. The site should not ship without these.

- [ ] **Replace the placeholder reviews.** `src/content/reviews.ts` contains
      three obvious placeholders with `verified: false`. Open your Google
      Business Profile, copy three real reviews verbatim with the reviewer's
      display name, and set `verified: true`. Include one four-star review; a
      wall of nothing but five stars reads as fabricated and converts worse
      than a fair mix. Until you do this, the reviews section shows the real
      aggregate rating and links out to Google, which is honest but weaker.

- [ ] **Confirm the dormitory photographs.** `rooms/dorm1.jpg` and
      `rooms/dorm3.jpg` from the old site do not appear to show this property.
      `rooms/dorm4.jpg` was a watermarked Shutterstock image and has been
      deleted. The dormitory page currently shows a designed "photograph
      coming" panel plus the real shared bathroom. Either shoot the dorm
      properly, or confirm dorm1 and dorm3 are yours and add them back to
      `photos` in `src/content/rooms.ts`.

- [ ] **Check every rate, distance and policy** in `src/content/hotel.ts` and
      `src/content/rooms.ts`. These came from the old site's `llms.txt` and are
      now load-bearing: they appear in the copy, the structured data and the
      file that AI assistants read. A wrong number here is repeated everywhere.

- [ ] **Verify the Google Maps CID** in `hotel.ts` resolves to your listing.

- [ ] **Set up the Google Business Profile link for reviews.** The
      `links.reviews` field in `hotel.ts` has a placeholder `placeid`. Get the
      real one from the Place ID Finder.

- [ ] **Set up 301 redirects for the old fragment URLs.** The previous sitemap
      listed `/#rooms`, `/#booking`, `/#faq` and so on. Fragments are not
      separate documents and Google discards them, so there is nothing to
      redirect at the server level, but check Search Console for any real old
      paths that are now 404ing. The 404 page is designed to catch these and
      route people onward.

### Should do in the first week

- [ ] Submit the new `sitemap.xml` in Google Search Console and request
      indexing on the homepage, `/rooms`, and the four landing pages.
- [ ] Submit to Bing Webmaster Tools. It feeds ChatGPT search.
- [ ] Update the website URL on Google Business Profile, Booking.com,
      MakeMyTrip, Goibibo and Instagram, so every citation points to the
      canonical `https://www.cibaracomforts.com`.
- [ ] Check the NAP (name, address, phone) is byte-identical across all of
      those. Inconsistent NAP is the most common local-SEO own goal.
- [ ] Run `npm run audit` and Lighthouse against the live domain, not just
      locally.
- [ ] Test the WhatsApp flow end to end on a real phone, from three entry
      points: the hero booking bar, a room page, and the sticky dock.
- [ ] Test with JavaScript disabled. Everything should still be readable and
      every contact link should still work.

### Worth doing, not urgent

- [ ] Add a `X-Robots-Tag` or Cloudflare rule for `/404/`.
- [ ] Photograph the dormitory, the reception desk, the building exterior and
      the parking area. See the shot list below.
- [ ] Ask five recent guests to leave a Google review. Reviews are the single
      highest-leverage thing available to this property and they cost nothing.

---

## Part 2: The photography shot list

The design is built to work with what exists, but the photography is the
weakest link and the cheapest thing to improve. In rough order of return:

1. **The building exterior at dusk**, lights on, from across the road. There is
   currently no photograph of the outside of the hotel, which is the first
   thing a guest looks for.
2. **The reception desk with a person at it.** The whole positioning rests on
   "someone is awake when you arrive". Show the someone.
3. **The dormitory**, properly. Wide, lit, beds made, lockers visible.
4. **Parking**, with a car in it. It is a real differentiator and there is no
   picture of it.
5. **Three or four detail shots**: the cane discs close up, the tile pattern,
   a folded towel stack, the kettle tray. The kettle photograph is currently
   the best image in the set, which tells you these work.
6. **The corridor and stairwell.** Guests want to know what they walk through.
7. **Harihareshwara Temple at 7am** and the Tungabhadra ghats at sunset, for
   the guides.

Practical notes: shoot in the morning or at dusk, never midday. Turn every lamp
on. Make the bed properly and remove the red plastic chair from frame. Shoot at
eye height from a corner, not from the doorway. A phone is fine; the grade in
the pipeline will pull it together.

Drop new files into `assets/source/`, run `npm run images`, reference them by
filename. Nothing else needs to change.

---

## Part 3: SEO plan

### What is already implemented

**Technical.** Canonical URLs on every page, `hreflang` for `en-IN` and
`x-default`, generated sitemap, permissive `robots.txt`, semantic HTML,
one `h1` per page and a clean heading hierarchy, descriptive alt text on every
image, an image sitemap by way of `ImageGallery` structured data, and clean
crawlable URLs.

**Structured data.** A connected `@graph` per page linking `Hotel`,
`LodgingBusiness`, `LocalBusiness`, `HotelRoom` with `Offer` and
`ReserveAction`, `AggregateRating`, `FAQPage`, `BreadcrumbList`, `Article`,
`ImageGallery` and `TouristAttraction`. See `docs/ARCHITECTURE.md` §6.

**Content clusters.**

| Cluster | Pages |
|---|---|
| Money pages | `/rooms`, five room pages, `/offers` |
| Location intent | `/hotels-in-harihar`, `/hotels-near-harihar-railway-station`, `/hotels-near-harihareshwara-temple`, `/stay-near-hampi` |
| Segment intent | `/corporate-stays`, `/wedding-accommodation` |
| Topical authority | four guides under `/guides` |
| Support | `/location`, `/faq`, `/gallery`, `/about`, `/contact`, `/policies` |

Every cluster page links to the relevant rooms and to its siblings, and every
page is reachable from the footer, so internal link equity flows without a link
farm.

**A note on doorway pages.** Four near-identical "hotel in X" pages would be
doorway spam under Google's guidelines and would get the whole site demoted.
Each landing page here carries substantive, distinct content written for that
specific intent, including advice that sends the reader elsewhere when
elsewhere is the better answer. Keep it that way if you add more.

### AI and answer-engine optimisation

`/llms.txt` is generated at build time from the same content files the site
renders, so it cannot go stale. It gives ChatGPT, Claude, Perplexity and Google's
AI Overview a clean structured document with every rate, distance and policy
stated plainly, which is far easier to extract correctly than a rendered page.

`robots.txt` explicitly allows every major AI crawler. That is a deliberate
choice, and it is the opposite of what a strong-brand hotel should do. A budget
lodge in a town of a hundred thousand has the reverse problem from a luxury
brand: almost nobody knows it exists. Blocking those crawlers removes the
property from a growing answer surface in exchange for protecting content with
no resale value.

FAQ answers are written to survive being lifted out of the page: each leads
with the direct answer and restates enough context to stand alone.

### What to do next, in priority order

1. **Reviews.** Get to 400+ Google reviews. Ask at checkout, every time. This
   outweighs everything else on this list combined for a local business.
2. **Google Business Profile.** Post weekly, upload new photographs monthly,
   answer every question and every review including the bad ones. GBP drives
   more bookings for a property like this than the website does.
3. **Two or three more guides.** "Davanagere benne dosa, where to actually eat
   it", "Chitradurga Fort in a day from Harihar", "Trains from Harihar: a
   practical guide". Each is a new entry point.
4. **Kannada language version.** No competitor in Harihar has one. A `/kn`
   locale would own a set of queries nobody is competing for. The site is
   structured for it: content is centralised, and `--font-kannada` already
   falls back to a system Kannada stack at zero byte cost. This is the biggest
   untapped SEO opportunity here.
5. **Local citations.** Justdial, Sulekha, TripAdvisor, Yellow Pages India,
   with byte-identical NAP.
6. **Digital PR.** One mention in a Karnataka travel publication is worth more
   than fifty directory listings.

### What not to do

Do not buy links. Do not spin up more location pages without real content
behind them. Do not add fake urgency ("3 people are viewing this"). Do not
publish invented reviews. Each of these is a short-term gain and a long-term
penalty, and this site's whole positioning rests on being trustworthy.

---

## Part 4: Testing strategy

The site has no runtime logic worth unit testing. Its failure modes are visual,
structural and content-related, which is what the tooling targets.

**What exists now.**

- `npm run typecheck` — the whole content model is typed, so a malformed room
  or a missing image id is a compile error.
- `npm run lint`
- `npm run audit` — runs against the built export and checks every route for:
  title and description length, canonical presence, `html lang`, exactly one
  `h1`, heading-level jumps, missing alt text, missing image dimensions,
  unlabelled buttons, links with no accessible name, unlabelled form controls,
  skip link, `main` landmark, viewport zoom, horizontal overflow, JSON-LD
  parseability, broken internal links, sitemap coverage, and required files in
  the export. Exits non-zero, so it can gate a deploy.
- `npm run shots` — screenshots at mobile and desktop, light and dark.

**What to add when it becomes worth it.**

1. **Wire `npm run audit` into CI.** It is currently a local command. Add a
   step to the workflow that serves `out/` and runs it. Twenty minutes of work
   and it prevents the whole class of regression this site is exposed to.
2. **Lighthouse CI** with a budget: performance ≥ 85 mobile, accessibility 100,
   SEO 100, CLS ≤ 0.02. Fail the build on regression.
3. **Playwright smoke test** of the three conversion paths: hero booking bar →
   correct WhatsApp URL, room page → correct WhatsApp URL with the room
   pre-filled, enquiry form → correct WhatsApp URL. These are the only genuine
   logic in the site and the only thing whose breakage costs money.
4. **Visual regression** with Playwright snapshots, if the site starts changing
   often enough for that to pay for itself. It probably will not.

Do not add a component test suite. There is almost no branching logic in these
components and the tests would test React, not the site.

---

## Part 5: What to build next

Ordered by return on effort, not by how interesting they are.

### High return

**Real reviews, wired up.** Already covered, still the top item.

**A Kannada version.** Nobody local has one. See the SEO section.

**Availability, honestly.** Not a booking engine. Just a manually maintained
"we are full on these dates" list that reception updates from the register, so
the booking bar can say "those dates are tight, message us" instead of nothing.
One JSON file, five minutes a day, and it removes the biggest weakness of the
enquiry-first flow. This is a much better use of effort than a channel manager.

**A repeat-guest path.** A meaningful share of guests come back. A "book the
room you had last time" WhatsApp link, sent after checkout, costs nothing.

### Medium return

**Connect the existing lodge software.** You have already built a Flask and
Firebase system for this property. If it exposes room state, `lib/booking.ts`
is a clean seam: swap the deep link for a fetch and the rest of the site is
unchanged. Start read-only, showing availability without taking payment.

**Instagram feed.** Was on the brief, deliberately not built. The official
embed is heavy and unreliable, and third-party widgets are worse. The right
implementation is a build-time fetch of the last six posts into static images,
which needs a Meta app and a long-lived token. Worth doing once the account
posts regularly; not worth 200 KB of third-party JavaScript before then.

**Weather.** Also on the brief, also not built. A live weather widget needs an
API key and a client-side fetch, for information every guest already has on
their phone. A better version is static seasonal guidance in the guides ("April
and May are hot, take the AC room"), which is more useful and costs nothing.

### Lower return, but asked for

**360° virtual tours.** The honest sequencing is: real photographs first, then a
tour. A 360° view of a room whose flat photographs are not yet good will not
help. When you do it, Pannellum is about 25 KB, lazy-loadable, and does not
need a subscription.

**A/B testing.** The site is ready for it (every conversion action is
instrumented with a `source`), but at this traffic volume you will not reach
significance on anything. Revisit at 5,000 sessions a month. Until then, watch
Clarity recordings, which will teach you more.

---

## Part 6: CMS options

You do not need one yet. Content is typed data in `src/content/`, editing it is
a pull request, and you are an engineer. That is the correct setup for now.

If somebody non-technical needs to edit copy, in order of fit:

**Keystatic.** Git-based, free, runs as a route in the same Next.js app, edits
commit straight to the repository. No database, no vendor, no runtime cost, and
the static export keeps working. Best fit by a distance.

**Sanity.** Free tier is generous, excellent editing experience, real-time
preview. Adds a build-time fetch and a vendor dependency. Right if the site
grows to dozens of pages with several editors.

**Contentful, Strapi, WordPress headless.** All overkill here. WordPress in
particular would reintroduce every problem this rebuild removed.

Whichever you pick, keep `src/content/hotel.ts` in code. Rates and phone numbers
belong under version control with a review step, not in a CMS field somebody can
fat-finger at midnight.

---

## Part 7: Suggested AI integrations

Ranked by whether they would actually help this business.

**Worth doing.**

1. **WhatsApp auto-reply for out-of-hours triage.** Reception is staffed 24
   hours, so this is not about coverage. It is about the first thirty seconds:
   acknowledge, confirm the dates were received, send the rate card. A human
   picks it up from there. WhatsApp Business API plus a small model.
2. **Review response drafting.** Feed a new Google review in, get a draft
   response in the property's voice. Responding to every review, including the
   bad ones, measurably improves rating over time and almost nobody does it
   consistently.
3. **Guide drafting from real questions.** Whatever guests ask reception most
   often is the next guide. Log the questions, draft from them.

**Do not do.**

- **A chatbot on the website.** The whole conversion strategy is "talk to a
  person on WhatsApp in five minutes". A bot on the site competes with the
  thing that works, adds JavaScript, and will confidently invent a rate.
- **AI-generated room photographs.** Fastest possible way to destroy the trust
  the rest of this site is built to earn. AI imagery for texture and mood is
  defensible; for rooms it is fraud.
- **AI-written reviews.** Illegal, and the first thing an alert guest checks.

---

## Part 8: Admin and operations

Not code, but the things that will actually determine whether this site works.

- **Answer WhatsApp fast.** The site promises five minutes. That promise is now
  in the copy, in the structured data and in `llms.txt`. Keep it or change it.
- **Keep the rate card current.** One file, one commit. A wrong rate on the
  site is worse than no site.
- **Ask for reviews at checkout.** Every guest, every time. A printed QR code
  at the desk is enough.
- **Post to Google Business Profile weekly.** Rooms, offers, a photograph of
  the temple. It takes two minutes and GBP rewards activity.
- **Check Search Console monthly** for coverage errors and for the queries you
  are appearing on. Those queries are your next guides.
- **Photograph the property once a year.** It is the highest-return maintenance
  task and the easiest one to postpone forever.
