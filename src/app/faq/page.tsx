'use client'

import * as Accordion from '@radix-ui/react-accordion'
import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { WhatsAppTextLink } from '@/components/booking/actions'
import { PageHeader } from '@/components/layout/page-header'
import { Section } from '@/components/ui/section'
import { FAQ_CATEGORIES, FAQS } from '@/content/faqs'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/utils'

/**
 * Full FAQ with client-side search.
 *
 * Search is a plain substring match over question and answer text, run against
 * an array that is already in memory. No index, no library, no network. With
 * twenty-two questions anything more is engineering for its own sake, and the
 * whole set is in the DOM at page load so it is fully crawlable regardless of
 * the search state.
 *
 * Metadata for this route lives in faq/layout.tsx, because a client component
 * cannot export it.
 */
export default function FaqPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return FAQS.filter((faq) => {
      const matchesCategory = category === 'all' || faq.category === category
      const matchesQuery = !q || `${faq.q} ${faq.a}`.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [query, category])

  return (
    <>
      <PageHeader
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Questions', path: '/faq' },
        ]}
        eyebrow={`${FAQS.length} questions`}
        titleLines={['Everything people ask', 'before they book']}
        lead="Answers written the way reception would give them on the phone. If something is not here, ask on WhatsApp and a person will reply within a few minutes."
      >
        <div className="max-w-xl">
          <label htmlFor="faq-search" className="sr-only">
            Search the questions
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-mute"
              aria-hidden
            />
            <input
              id="faq-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try: parking, late check-in, AC, GST"
              className="h-12 w-full rounded-full border border-line bg-paper pr-4 pl-11 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-mute focus:border-line-strong"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[{ id: 'all', label: 'All' }, ...FAQ_CATEGORIES].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
                aria-pressed={category === item.id}
                className={cn(
                  'inline-flex h-9 items-center rounded-full border px-3.5 text-[0.8125rem] transition-colors',
                  category === item.id
                    ? 'border-ink bg-ink text-paper'
                    : 'border-line text-ink-soft hover:border-line-strong hover:text-ink',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </PageHeader>

      <Section tone="paper">
        <div className="container-narrow">
          {/* Radix renders each accordion trigger inside an h3. Without this
              h2 the document outline jumps straight from h1 to h3. */}
          <h2 className="sr-only">All questions and answers</h2>
          <p className="text-[0.8125rem] text-ink-mute" aria-live="polite">
            {results.length} {results.length === 1 ? 'question' : 'questions'}
            {query && ` matching “${query}”`}
          </p>

          {results.length === 0 ? (
            <div className="mt-10 rounded-[var(--radius-card)] border border-line bg-paper-2 p-10 text-center">
              <p className="font-display text-[1.5rem] text-ink">Nothing matched that</p>
              <p className="mx-auto mt-3 max-w-md text-[0.9375rem] text-ink-soft">
                Which is fine. Reception answers WhatsApp around the clock and will know.
              </p>
              <p className="mt-6">
                <WhatsAppTextLink source="faq_empty_state">
                  Ask us directly on WhatsApp
                </WhatsAppTextLink>
              </p>
            </div>
          ) : (
            <Accordion.Root type="multiple" className="mt-8 border-t border-line">
              {results.map((faq) => (
                <Accordion.Item key={faq.q} value={faq.q} className="border-b border-line">
                  <Accordion.Header>
                    <Accordion.Trigger
                      onClick={() => track({ name: 'faq_open', params: { question: faq.q } })}
                      className="group flex w-full items-start justify-between gap-6 py-6 text-left"
                    >
                      <span className="font-display text-[length:var(--text-h3)] leading-snug text-ink transition-colors group-hover:text-brass-3 dark:group-hover:text-brass-2">
                        {faq.q}
                      </span>
                      <span
                        aria-hidden
                        className="mt-1 grid size-7 shrink-0 place-items-center rounded-full border border-line text-ink-mute transition-all duration-500 ease-[var(--ease-swift)] group-data-[state=open]:rotate-45 group-data-[state=open]:border-brass group-data-[state=open]:bg-brass group-data-[state=open]:text-white"
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
          )}
        </div>
      </Section>
    </>
  )
}
