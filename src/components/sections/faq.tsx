'use client'

import * as Accordion from '@radix-ui/react-accordion'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { WhatsAppTextLink } from '@/components/booking/actions'
import { Reveal } from '@/components/motion/reveal'
import { Section, SectionHeading } from '@/components/ui/section'
import type { Faq } from '@/content/faqs'
import { track } from '@/lib/analytics'

/**
 * FAQ accordion.
 *
 * Answers are written to stand alone, because most of them will be read
 * somewhere other than this page: as a Google rich result, inside an AI
 * Overview, or read aloud by a voice assistant. Each one leads with the direct
 * answer and repeats enough context to survive being lifted out of the page.
 *
 * `type="multiple"` rather than a single-open accordion: a guest comparing
 * policies wants two answers side by side, and forcing one closed to open
 * another is a small, constant irritation.
 *
 * All questions are rendered in the DOM regardless of open state, so the
 * content is crawlable without JavaScript execution.
 */
export function Faqs({
  items,
  heading = 'Questions people ask before booking',
  eyebrow = 'Straight answers',
  lead = 'If yours is not here, message us on WhatsApp. Reception replies in a few minutes, at any hour.',
  showAllLink = true,
  tone = 'sand',
}: {
  items: Faq[]
  heading?: string
  eyebrow?: string
  lead?: string
  showAllLink?: boolean
  tone?: 'paper' | 'sand'
}) {
  return (
    <Section id="faq" tone={tone} labelledBy="faq-heading">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading id="faq-heading" eyebrow={eyebrow} title={heading} lead={lead} />
            {showAllLink && (
              <Reveal delay={120} className="mt-7">
                <Link
                  href="/faq"
                  className="text-[0.875rem] font-medium text-ink underline decoration-brass decoration-2 underline-offset-4 transition-colors hover:decoration-ink"
                >
                  See all {'→'}
                </Link>
              </Reveal>
            )}
          </div>

          <Reveal delay={80}>
            <Accordion.Root type="multiple" className="border-t border-line">
              {items.map((faq) => (
                <Accordion.Item
                  key={faq.q}
                  value={faq.q}
                  className="border-b border-line"
                >
                  <Accordion.Header>
                    <Accordion.Trigger
                      onClick={() => track({ name: 'faq_open', params: { question: faq.q } })}
                      className="group flex w-full items-start justify-between gap-6 py-6 text-left"
                    >
                      <span className="text-[length:var(--text-h3)] font-display leading-snug text-ink transition-colors group-hover:text-brass-3 dark:group-hover:text-brass-2">
                        {faq.q}
                      </span>
                      <span
                        aria-hidden
                        className="mt-1 grid size-7 shrink-0 place-items-center rounded-full border border-line text-ink-mute transition-all duration-500 ease-[var(--ease-swift)] group-hover:border-line-strong group-data-[state=open]:rotate-45 group-data-[state=open]:border-brass group-data-[state=open]:bg-brass group-data-[state=open]:text-white"
                      >
                        <Plus className="size-3.5" />
                      </span>
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="overflow-hidden data-[state=closed]:animate-[acc-up_260ms_var(--ease-in-soft)] data-[state=open]:animate-[acc-down_320ms_var(--ease-out-soft)]">
                    <p className="max-w-[62ch] pr-12 pb-7 text-[length:var(--text-body-lg)] leading-relaxed text-ink-soft">
                      {faq.a}
                    </p>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>

            <p className="mt-8 text-[0.9375rem] text-ink-mute">
              Still unsure about something?{' '}
              <WhatsAppTextLink source="faq_section">Ask on WhatsApp</WhatsAppTextLink>. A person
              answers, not a bot.
            </p>
          </Reveal>
        </div>
      </div>
    </Section>
  )
}
