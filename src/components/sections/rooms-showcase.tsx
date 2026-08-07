import { ArrowUpRight, BedDouble, Fan, Snowflake, Users } from 'lucide-react'
import Link from 'next/link'
import { Reveal } from '@/components/motion/reveal'
import { Picture } from '@/components/media/picture'
import { Section, SectionHeading } from '@/components/ui/section'
import { formatINR, ROOMS, type Room } from '@/content/rooms'
import { cn } from '@/lib/utils'

/**
 * Room index.
 *
 * An editorial index rather than a grid of identical cards. The featured room
 * takes a full-width spread and the remaining four sit in a two-up grid, which
 * gives the eye a clear entry point and an obvious path through the price
 * ladder. A uniform five-card grid makes every room look equally considered
 * and therefore equally anonymous.
 *
 * Prices are visible on the card. Hiding the rate behind a click is standard
 * OTA practice and it suppresses direct bookings: the entire pitch here is
 * that booking direct is cheaper, which only works if the number is legible
 * from the first screen.
 */
export function RoomsShowcase() {
  const featured = ROOMS.find((r) => r.featured) ?? ROOMS[0]
  const rest = ROOMS.filter((r) => r.slug !== featured.slug)

  return (
    <Section id="rooms" tone="paper" labelledBy="rooms-heading">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            id="rooms-heading"
            eyebrow="Five rooms"
            title="From a ₹250 bunk to the quietest room in the building"
            lead="Every rate below is the direct rate, taxes included, for two guests. Nothing is charged until you arrive."
            className="max-w-2xl"
          />
          <Reveal delay={100}>
            <Link
              href="/rooms"
              className="group inline-flex items-center gap-2 text-[0.875rem] font-medium text-ink"
            >
              Compare all five
              <ArrowUpRight className="size-4 text-brass transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 space-y-6">
          <FeaturedRoomCard room={featured} />
          <div className="grid gap-6 sm:grid-cols-2">
            {rest.map((room, i) => (
              <RoomCard key={room.slug} room={room} delay={i * 70} />
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}

function RoomMeta({ room, className }: { room: Room; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.75rem]', className)}>
      <li className="inline-flex items-center gap-1.5">
        <Users className="size-3.5 opacity-60" aria-hidden />
        Sleeps {room.occupancy.max}
      </li>
      <li className="inline-flex items-center gap-1.5">
        <BedDouble className="size-3.5 opacity-60" aria-hidden />
        {room.bed.split(',')[0]}
      </li>
      <li className="inline-flex items-center gap-1.5">
        {room.ac ? (
          <Snowflake className="size-3.5 opacity-60" aria-hidden />
        ) : (
          <Fan className="size-3.5 opacity-60" aria-hidden />
        )}
        {room.ac ? 'Air conditioned' : 'Fan cooled'}
      </li>
      <li className="inline-flex items-center gap-1.5">
        <span aria-hidden className="size-1 rounded-full bg-current opacity-40" />
        {room.bathroom} bathroom
      </li>
    </ul>
  )
}

function Price({ room, onDark = false }: { room: Room; onDark?: boolean }) {
  return (
    <p className="flex items-baseline gap-1.5">
      <span
        className={cn(
          'font-display text-[1.75rem] leading-none tnum',
          onDark ? 'text-white' : 'text-ink',
        )}
      >
        {formatINR(room.price)}
      </span>
      <span className={cn('text-[0.75rem]', onDark ? 'text-white/60' : 'text-ink-mute')}>
        / {room.priceUnit}
      </span>
    </p>
  )
}

function FeaturedRoomCard({ room }: { room: Room }) {
  const photo = room.photos[0]
  return (
    <Reveal>
      <Link
        href={`/rooms/${room.slug}`}
        className="group relative block overflow-hidden rounded-[var(--radius-panel)] bg-forest-2"
      >
        {photo && (
          <Picture
            id={photo.id}
            alt={photo.alt}
            sizes="(min-width: 1280px) 1200px, 100vw"
            ratio="16 / 10"
            focal="58% 45%"
            className="transition-transform duration-[1200ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-forest-2/92 via-forest-2/35 to-transparent"
        />

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9 lg:p-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="eyebrow text-brass-2">Most booked</p>
              <h3 className="mt-3 text-[clamp(1.5rem,1.1rem+1.7vw,2.5rem)] text-white">
                {room.name}
              </h3>
              <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-white/80">
                {room.summary}
              </p>
              <RoomMeta room={room} className="mt-5 text-white/70" />
            </div>

            <div className="flex items-center gap-5">
              <Price room={room} onDark />
              <span
                aria-hidden
                className="grid size-12 place-items-center rounded-full border border-white/25 text-white transition-all duration-500 ease-[var(--ease-swift)] group-hover:border-white group-hover:bg-white group-hover:text-forest-2"
              >
                <ArrowUpRight className="size-5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </Reveal>
  )
}

function RoomCard({ room, delay }: { room: Room; delay: number }) {
  const photo = room.photos[0]
  return (
    <Reveal delay={delay}>
      <Link
        href={`/rooms/${room.slug}`}
        className={cn(
          'group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)]',
          'border border-line bg-paper transition-all duration-500 ease-[var(--ease-swift)]',
          'hover:-translate-y-1 hover:border-line-strong hover:shadow-[var(--shadow-lift)]',
        )}
      >
        <div className="overflow-hidden">
          {photo ? (
            <Picture
              id={photo.id}
              alt={photo.alt}
              sizes="(min-width: 640px) 45vw, 100vw"
              ratio="4 / 3"
              className="transition-transform duration-[1100ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
            />
          ) : (
            <NoPhotoPanel label={room.shortName} />
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-[length:var(--text-h3)]">{room.name}</h3>
            <Price room={room} />
          </div>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">{room.summary}</p>
          <RoomMeta room={room} className="mt-auto pt-6 text-ink-mute" />
        </div>
      </Link>
    </Reveal>
  )
}

/**
 * Placeholder for a room with no photograph yet.
 *
 * A designed absence beats a stock photograph of somebody else's building.
 * This state is deliberately reachable: see content/rooms.ts.
 */
export function NoPhotoPanel({ label, ratio = '4 / 3' }: { label: string; ratio?: string }) {
  return (
    <div
      style={{ aspectRatio: ratio }}
      className="grid w-full place-items-center bg-paper-3 dark:bg-paper-3"
    >
      <div className="text-center">
        <p className="font-display text-[2rem] text-line-strong">{label}</p>
        <p className="mt-1 text-[0.6875rem] tracking-[0.16em] text-ink-mute uppercase">
          Photograph coming
        </p>
      </div>
    </div>
  )
}
