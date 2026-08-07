'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Picture } from '@/components/media/picture'
import { GALLERY, GALLERY_CATEGORIES, type GalleryItem } from '@/content/gallery'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/utils'

/**
 * Gallery with filters and a full-screen viewer.
 *
 * Filtering is CSS-only: every item stays in the DOM and non-matching ones are
 * hidden. That keeps all images crawlable and indexable regardless of the
 * active filter, avoids re-mounting <img> elements (which would re-trigger
 * network requests and destroy the browser cache benefit), and makes the
 * transition a pure opacity and scale change on the compositor.
 *
 * The grid is CSS columns rather than a JavaScript masonry library. It costs
 * nothing, reflows natively, and the visual difference at this item count is
 * not worth 15 KB and a resize observer.
 */
export function GalleryGrid() {
  const [filter, setFilter] = useState<string>('all')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const visible = GALLERY.filter((item) => filter === 'all' || item.category === filter)

  const open = useCallback(
    (item: GalleryItem) => {
      const index = visible.findIndex((v) => v.id === item.id)
      setOpenIndex(index)
      track({ name: 'gallery_open', params: { image: item.id } })
    },
    [visible],
  )

  const step = useCallback(
    (direction: 1 | -1) => {
      setOpenIndex((current) => {
        if (current === null) return current
        return (current + direction + visible.length) % visible.length
      })
    },
    [visible.length],
  )

  useEffect(() => {
    if (openIndex === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openIndex, step])

  const active = openIndex !== null ? visible[openIndex] : null

  return (
    <>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter photographs">
        {GALLERY_CATEGORIES.map((category) => {
          const selected = filter === category.id
          const count =
            category.id === 'all'
              ? GALLERY.length
              : GALLERY.filter((g) => g.category === category.id).length
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setFilter(category.id)}
              aria-pressed={selected}
              className={cn(
                'inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[0.8125rem] font-medium transition-colors duration-300',
                selected
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line text-ink-soft hover:border-line-strong hover:text-ink',
              )}
            >
              {category.label}
              <span className={cn('tnum text-[0.75rem]', selected ? 'opacity-60' : 'opacity-50')}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {GALLERY.map((item) => {
          const shown = filter === 'all' || item.category === filter
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => open(item)}
              hidden={!shown}
              className={cn(
                'group relative block w-full break-inside-avoid overflow-hidden rounded-[var(--radius-image)]',
                'transition-[transform,box-shadow] duration-500 ease-[var(--ease-swift)]',
                'hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]',
              )}
            >
              <Picture
                id={item.id}
                alt={item.alt}
                sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw"
                className="transition-transform duration-[1100ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-forest-2/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
              <span
                aria-hidden
                className="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-paper/90 text-ink opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100"
              >
                <Expand className="size-4" />
              </span>
              {item.caption && (
                <span className="absolute inset-x-0 bottom-0 translate-y-2 p-4 text-left text-[0.8125rem] text-white opacity-0 transition-all duration-500 ease-[var(--ease-swift)] group-hover:translate-y-0 group-hover:opacity-100">
                  {item.caption}
                </span>
              )}
              <span className="sr-only">View larger: {item.alt}</span>
            </button>
          )
        })}
      </div>

      <Dialog.Root open={openIndex !== null} onOpenChange={(o) => !o && setOpenIndex(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-forest-2/95 backdrop-blur-md" />
          <Dialog.Content className="fixed inset-0 z-50 flex flex-col outline-none">
            <Dialog.Title className="sr-only">Photograph viewer</Dialog.Title>
            <Dialog.Description className="sr-only">
              Use the left and right arrow keys to move between photographs, and escape to close.
            </Dialog.Description>

            <div className="flex items-center justify-between p-4 text-white/70">
              <span className="text-[0.8125rem] tnum">
                {openIndex !== null ? openIndex + 1 : 0} / {visible.length}
              </span>
              <Dialog.Close
                aria-label="Close viewer"
                className="grid size-11 place-items-center rounded-full transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="size-5" aria-hidden />
              </Dialog.Close>
            </div>

            <div className="flex min-h-0 flex-1 items-center gap-2 px-2 sm:px-4">
              <ViewerButton onClick={() => step(-1)} label="Previous photograph">
                <ChevronLeft className="size-6" aria-hidden />
              </ViewerButton>

              <figure className="flex min-h-0 flex-1 flex-col items-center justify-center">
                {active && (
                  <Picture
                    key={active.id}
                    id={active.id}
                    alt={active.alt}
                    sizes="(min-width: 1024px) 80vw, 100vw"
                    priority
                    className="max-h-[72vh] w-auto max-w-full rounded-[var(--radius-image)]"
                    imgClassName="!relative !h-auto !w-auto max-h-[72vh] max-w-full object-contain"
                  />
                )}
                {active?.caption && (
                  <figcaption className="mt-5 max-w-xl px-4 text-center text-[0.875rem] text-white/70">
                    {active.caption}
                  </figcaption>
                )}
              </figure>

              <ViewerButton onClick={() => step(1)} label="Next photograph">
                <ChevronRight className="size-6" aria-hidden />
              </ViewerButton>
            </div>

            <div className="h-6" />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

function ViewerButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-12 shrink-0 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  )
}
