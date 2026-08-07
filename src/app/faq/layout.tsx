import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { FAQS } from '@/content/faqs'
import { HOTEL } from '@/content/hotel'
import { breadcrumbNode, faqNode, jsonLdGraph } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'

/**
 * The FAQ page itself is a client component (it has search), so its metadata
 * and structured data live here in the segment layout.
 *
 * Every question on the site is emitted as FAQPage JSON-LD from this one
 * route. Emitting the full set from a single canonical page, rather than
 * duplicating it across every page that shows a subset, is what avoids the
 * duplicate-structured-data warning in Search Console.
 */
export const metadata: Metadata = pageMetadata({
  title: 'Frequently Asked Questions',
  description: `Answers about rates, check-in times, parking, air conditioning, GST invoices, pets and group bookings at ${HOTEL.name} in Harihar, Karnataka.`,
  path: '/faq',
})

export default function FaqLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdGraph(
            breadcrumbNode([
              { name: 'Home', path: '/' },
              { name: 'Questions', path: '/faq' },
            ]),
            faqNode(FAQS),
          ),
        }}
      />
      {children}
    </>
  )
}
