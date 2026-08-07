import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { Reveal } from '@/components/motion/reveal'
import { Picture } from '@/components/media/picture'
import { Section, SectionHeading } from '@/components/ui/section'
import { GALLERY } from '@/content/gallery'

/**
 * Gallery teaser.
 *
 * A staggered five-image spread rather than a carousel. Carousels on a
 * homepage are seen by a small minority of visitors past the first slide, they
 * add JavaScript and a swipe-versus-scroll conflict on touch, and they hide
 * exactly the photography a budget property most needs a guest to see.
 * Everything below is visible at once.
 */
const PICKS = ['hero4', 'single1', 'double1', 'premium3', 'premium1'] as const

export function GalleryTeaser() {
  const items = PICKS.map((id) => GALLERY.find((g) => g.id === id)).filter(
    (g): g is NonNullable<typeof g> => Boolean(g),
  )

  return (
    <Section tone="paper" labelledBy="gallery-heading">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            id="gallery-heading"
            eyebrow="The building"
            title="Photographed as it is, on an ordinary Tuesday"
            lead="No wide-angle tricks and no borrowed stock. If a floor tile is chipped in a picture, it is chipped in the room."
            className="max-w-2xl"
          />
          <Reveal delay={100}>
            <Link
              href="/gallery"
              className="group inline-flex items-center gap-2 text-[0.875rem] font-medium text-ink"
            >
              Open the full gallery
              <ArrowUpRight className="size-4 text-brass transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {items.map((item, i) => {
            // A deliberately uneven rhythm: the first image takes two columns
            // and two rows, which breaks the grid enough to read as editorial.
            const featured = i === 0
            return (
              <Reveal
                key={item.id}
                delay={i * 60}
                className={featured ? 'col-span-2 row-span-2' : ''}
              >
                <Link
                  href="/gallery"
                  className="group block overflow-hidden rounded-[var(--radius-image)]"
                >
                  <Picture
                    id={item.id}
                    alt={item.alt}
                    sizes={
                      featured
                        ? '(min-width: 1024px) 50vw, 100vw'
                        : '(min-width: 1024px) 25vw, 50vw'
                    }
                    ratio={featured ? '1 / 1' : '1 / 1'}
                    className="transition-transform duration-[1100ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.05]"
                  />
                  <span className="sr-only">{item.alt}. Open the full gallery.</span>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
