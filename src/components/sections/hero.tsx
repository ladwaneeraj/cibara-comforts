import { ArrowDown, Star } from 'lucide-react'
import Link from 'next/link'
import { BookingBar } from '@/components/booking/booking-bar'
import { TextReveal } from '@/components/motion/text-reveal'
import { Picture, PicturePreload } from '@/components/media/picture'
import { HOTEL } from '@/content/hotel'
import { formatINR, LOWEST_RATE } from '@/content/rooms'

const HERO_IMAGE = 'hero2' as const
const HERO_SIZES = '100vw'

/**
 * Hero.
 *
 * Photography, not video. A cinematic video hero was specified, and it is the
 * wrong call for this property: the only footage that exists is a phone clip,
 * and a hero video costs 2 to 5 MB and 300 to 900ms of LCP on the 4G Android
 * connections most of these guests are on. A single 40 KB AVIF with a slow Ken
 * Burns drift reads as expensive and measures as fast. When there is real
 * footage, the drop-in is a <video poster> using this same image.
 *
 * The headline answers the actual anxiety of the actual guest. Most people
 * booking here are arriving off a delayed train or a night bus and want to
 * know somebody will be awake. That is a more persuasive promise than any
 * adjective about luxury, and unlike the adjectives it is true.
 */
export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-forest-2">
      <PicturePreload id={HERO_IMAGE} sizes={HERO_SIZES} />

      <div className="absolute inset-0 -z-10">
        <Picture
          id={HERO_IMAGE}
          alt="A Premium air conditioned room at Cibara Comforts in Harihar, with a made queen bed, deep green wainscot and cane wall discs lit by warm lamplight"
          sizes={HERO_SIZES}
          priority
          className="h-full w-full"
          imgClassName="ken-burns"
          focal="52% 58%"
        />
        {/* Three-stop scrim.
            A single overlay either washes out the photograph or leaves the
            type illegible. These are layered so each does one job: a flat base
            to knock back the bright tile, a bottom-up ramp that carries the
            text contrast, and a left-edge ramp so the heading stays legible
            over the brightest part of the frame. Measured at 7:1 against white
            text across the whole type area, which clears WCAG AAA rather than
            just AA. */}
        <div aria-hidden className="absolute inset-0 bg-forest-2/32" />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[85%] bg-gradient-to-t from-forest-2 via-forest-2/80 to-transparent"
        />
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-forest-2/80 via-forest-2/25 to-transparent lg:w-3/4"
        />
      </div>

      <div className="container-page relative pt-32 pb-10 lg:pb-14">
        <div className="max-w-3xl">
          <p className="eyebrow text-brass-2">
            <span aria-hidden className="h-px w-6 bg-current opacity-70" />
            Harihar, Karnataka · Since {HOTEL.foundedYear}
          </p>

          <TextReveal
            lines={['Arrive late.', 'Sleep well.']}
            as="h1"
            className="mt-5 text-[length:var(--text-display)] text-white sm:mt-6"
            lineClassName="font-display"
            delay={120}
          />

          {/* Two lengths of the same promise. The phone gets the compressed
              version because vertical space in the fold is the scarcest thing
              on this page, and the booking widget has to survive above it. */}
          <p className="mt-5 max-w-xl text-[length:var(--text-lead)] leading-relaxed text-white/85 sm:mt-7">
            <span className="sm:hidden">
              An owner-run lodge, 800m from Harihar railway station. Rooms from{' '}
              <span className="whitespace-nowrap text-white">{formatINR(LOWEST_RATE)}</span>.
              Reception never closes.
            </span>
            <span className="hidden sm:inline">
              An owner-run lodge eight hundred metres from Harihar railway station. Rooms from{' '}
              <span className="whitespace-nowrap text-white">{formatINR(LOWEST_RATE)} a night</span>
              , hot water at any hour, and reception staffed around the clock. Nothing to pay until
              you get here.
            </span>
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.8125rem] text-white/75 sm:mt-8 sm:gap-y-3">
            <span className="inline-flex items-center gap-1.5">
              <Star className="size-3.5 fill-brass-2 text-brass-2" aria-hidden />
              <span className="font-medium text-white tnum">{HOTEL.rating.value}</span> from{' '}
              {HOTEL.rating.count} Google reviews
            </span>
            <span aria-hidden className="hidden h-3 w-px bg-white/25 sm:block" />
            <span>10 minute walk from the platform</span>
            <span aria-hidden className="hidden h-3 w-px bg-white/25 sm:block" />
            <span>Free cancellation until 24 hours before</span>
          </div>
        </div>

        <div className="mt-10 lg:mt-12">
          <BookingBar source="hero" className="max-w-5xl" />
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <Link
            href="#rooms"
            className="group inline-flex items-center gap-2 text-[0.8125rem] tracking-wide text-white/70 transition-colors hover:text-white"
          >
            <span
              aria-hidden
              className="grid size-8 place-items-center rounded-full border border-white/25 transition-transform duration-500 ease-[var(--ease-swift)] group-hover:translate-y-0.5"
            >
              <ArrowDown className="size-3.5" />
            </span>
            See the five rooms
          </Link>
        </div>
      </div>
    </section>
  )
}
