import { ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { TierCta } from '@/components/booking/tier-cta'
import { RoomPhotoSlider } from '@/components/rooms/room-photo-slider'
import { AMENITIES_BY_ID } from '@/content/amenities'
import { HOTEL } from '@/content/hotel'
import { formatINR, type Room } from '@/content/rooms'

/**
 * Mobile-only booking hero for a bookable room page.
 *
 * The old interior header opened with a breadcrumb, a three-line display
 * title and a lead paragraph — a full phone screen of text before any photo,
 * price or CTA. On a phone that is the fold wasted. This puts the one thing
 * that sells (the room photo), the price, the rating, a facilities preview and
 * a "Book online" button all in the first screen. Desktop keeps the standard
 * PageHeader (this is `lg:hidden`); that layout already works on wide screens.
 */
export function RoomHeroMobile({ room }: { room: Room }) {
  const preview = room.amenities.slice(0, 6)

  return (
    <div className="border-b border-line bg-paper-2 lg:hidden">
      <div className="container-page pt-[5.25rem] pb-3">
        <Link
          href="/rooms"
          className="inline-flex items-center gap-1.5 text-[0.8125rem] text-ink-mute transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4 text-brass" aria-hidden />
          All rooms
        </Link>
      </div>

      {room.photos.length > 0 && (
        <div className="relative">
          <RoomPhotoSlider photos={room.photos} />
          <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex flex-wrap gap-2">
            {room.ac && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0a0f0b]/70 px-2.5 py-1 text-[0.75rem] font-medium text-white backdrop-blur-sm">
                ❄ Air conditioned
              </span>
            )}
            {room.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#0a0f0b]/70 px-2.5 py-1 text-[0.75rem] font-medium text-brass-2 backdrop-blur-sm">
                <Sparkles className="size-3" aria-hidden /> Best Experience
              </span>
            )}
          </div>
        </div>
      )}

      <div className="container-page py-5">
        <h1 className="text-[length:var(--text-h2)]">{room.name}</h1>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.875rem] text-ink-soft">
          <span className="font-medium text-brass-2">★ {HOTEL.rating.value}</span>
          <span className="text-ink-mute">·</span>
          <span>
            {HOTEL.rating.count} {HOTEL.rating.source} reviews
          </span>
          <span className="text-ink-mute">·</span>
          <span>Sleeps {room.occupancy.max}</span>
        </div>

        <p className="mt-4 flex items-baseline gap-2">
          <span className="font-display text-[2rem] leading-none text-ink tnum">{formatINR(room.price)}</span>
          <span className="text-[0.8125rem] text-ink-mute">/ {room.priceUnit}</span>
          <span className="ml-auto text-[0.8125rem] font-medium text-[#0F7D42] dark:text-[#5FD98C]">
            taxes included
          </span>
        </p>

        <TierCta slug={room.slug} source={`room_${room.slug}_hero`} featured />

        {preview.length > 0 && (
          <div className="mt-6 border-t border-line pt-5">
            <p className="text-[0.6875rem] font-medium tracking-[0.14em] text-ink-mute uppercase">
              What you get
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {preview.map((id) => {
                const amenity = AMENITIES_BY_ID[id]
                if (!amenity) return null
                return (
                  <li
                    key={id}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-[0.8125rem] text-ink-soft"
                  >
                    <amenity.icon className="size-3.5 text-brass" aria-hidden />
                    {amenity.label}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
