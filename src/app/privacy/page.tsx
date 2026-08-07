import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/page-header'
import { Prose } from '@/components/ui/prose'
import { Section } from '@/components/ui/section'
import { HOTEL } from '@/content/hotel'
import { breadcrumbNode, jsonLdGraph } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Privacy', path: '/privacy' },
]

export const metadata: Metadata = pageMetadata({
  title: 'Privacy',
  description: `What this site collects, which is almost nothing. The booking form composes a WhatsApp message you send yourself. No data is stored here.`,
  path: '/privacy',
  noIndex: false,
})

/**
 * Privacy notice.
 *
 * Kept short and specific because the site genuinely collects very little.
 * A generic ten-page template would be both untrue and less useful.
 *
 * NOTE FOR LAUNCH: this is written to describe the site as built. If you later
 * add a form backend, a chat widget or a booking engine, this page has to be
 * updated to match, and India's Digital Personal Data Protection Act 2023
 * obligations then start to apply in a way they largely do not today. This is
 * a factual description, not legal advice.
 */
const BODY = `
## The short version

This website is a set of static files. It has no database, no login, no server-side code and no form backend. Nothing you type into it is stored anywhere by us.

## What the site collects

**Nothing directly.** The booking widget and the enquiry form do not submit to a server. They assemble the details you enter into a WhatsApp message and open it in your own WhatsApp, where you decide whether to send it. Until you press send in WhatsApp, the information exists only in your browser.

## What third parties may collect

- **GitHub Pages**, which serves this site, records standard web server logs including IP addresses. This is outside our control and is covered by GitHub's own privacy statement.
- **Google Analytics**, if enabled, sets cookies and records anonymised usage data. It is loaded only after you interact with the page, so a visitor who leaves immediately is not tracked at all.
- **Microsoft Clarity**, if enabled, records anonymised interaction data. Same deferred loading.
- **Google Maps** loads only when you press the button to load it. Until then, no request goes to Google from the map area.
- **WhatsApp**, once you send a message, holds that conversation under Meta's own terms.

## What we collect when you actually stay

Separately from this website, when you check in we record your name, contact number and government photo ID, because Karnataka law requires accommodation providers to do so. Those records are held at the property, used for that legal purpose and for your booking, and not sold or shared for marketing.

## Cookies

The site itself sets one item of local storage, remembering whether you chose the light or the dark theme. It contains no personal information and never leaves your device. Analytics cookies, if analytics is enabled, are set by those third parties and only after you interact with the page.

## Your choices

You can block third-party scripts in your browser and every part of this site will continue to work, including the booking flow. Nothing here depends on tracking.

## Asking us about your data

For anything about records held at the property, email us or message reception. We will answer.
`

export default function PrivacyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdGraph(breadcrumbNode(CRUMBS)) }}
      />

      <PageHeader
        crumbs={CRUMBS}
        eyebrow="Privacy"
        title="What this site collects, which is almost nothing"
        lead="A short, specific and true description rather than a generic template. If it changes, this page changes."
      />

      <Section tone="paper">
        <div className="container-narrow">
          <Prose source={BODY} />
          <p className="mt-14 border-t border-line pt-6 text-[0.8125rem] text-ink-mute">
            Questions to{' '}
            <a
              href={`mailto:${HOTEL.contact.email}`}
              className="underline decoration-brass underline-offset-4"
            >
              {HOTEL.contact.email}
            </a>
            . This page describes the site as built and is not legal advice.
          </p>
        </div>
      </Section>
    </>
  )
}
