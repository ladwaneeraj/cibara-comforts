import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BookingBar } from '@/components/booking/booking-bar'
import { PageHeader } from '@/components/layout/page-header'
import { Picture } from '@/components/media/picture'
import { Reveal } from '@/components/motion/reveal'
import { Faqs } from '@/components/sections/faq'
import { NoPhotoPanel } from '@/components/sections/rooms-showcase'
import { Section } from '@/components/ui/section'
import { AMENITIES_BY_ID } from '@/content/amenities'
import { FAQS } from '@/content/faqs'
import { HOTEL } from '@/content/hotel'
import { NEARBY } from '@/content/nearby'
import { formatINR, ROOMS, ROOMS_BY_SLUG } from '@/content/rooms'
import { breadcrumbNode, faqNode, jsonLdGraph, roomNode } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'

/** One static route per room. `dynamicParams` is implicitly false on export. */
export function generateStaticParams() {
  return ROOMS.map((room) => ({ slug: room.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const room = ROOMS_BY_SLUG[slug]
  if (!room) return {}

  return pageMetadata({
    title: `${room.shortName} Room, ${formatINR(room.price)}`,
    description: `${room.summary} ${formatINR(room.price)} per ${room.priceUnit} at ${HOTEL.name}, Harihar. Free cancellation, pay at the hotel.`,
    path: `/rooms/${room.slug}`,
    image: `/og/room-${room.slug}.jpg`,
    imageAlt: room.photos[0]?.alt ?? room.name,
  })
}

export default async function RoomPage({ params }: Props) {
  const { slug } = await params
  const room = ROOMS_BY_SLUG[slug]
  if (!room) notFound()

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Rooms', path: '/rooms' },
    { name: room.shortName, path: `/rooms/${room.slug}` },
  ]

  // Room-relevant FAQs only. A dorm page asking about GST invoices is noise.
  const roomFaqs = FAQS.filter(
    (f) =>
      f.category === 'rooms' ||
      f.category === 'policies' ||
      (f.category === 'booking' && f.q.toLowerCase().includes('pay')),
  ).slice(0, 6)

  const others = ROOMS.filter((r) => r.slug !== room.slug)
  const walkable = NEARBY.filter((n) => n.walkMinutes !== null)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdGraph(breadcrumbNode(crumbs), roomNode(room), faqNode(roomFaqs)),
        }}
      />

      <PageHeader
        crumbs={crumbs}
        eyebrow={`${formatINR(room.price)} per ${room.priceUnit} · sleeps up to ${room.occupancy.max}`}
        title={room.name}
        lead={room.summary}
      >
        <BookingBar roomSlug={room.slug} source={`room_${room.slug}`} variant="inline" className="max-w-3xl" />
      </PageHeader>

      {/* Photography */}
      <Section tone="paper" className="!pb-0">
        <div className="container-page">
          {room.photos.length > 0 ? (
            <div className="grid gap-3 sm:gap-4 lg:grid-cols-12">
              {room.photos.map((photo, i) => (
                <Reveal
                  key={photo.id}
                  delay={i * 60}
                  className={
                    i === 0
                      ? 'lg:col-span-12'
                      : i % 3 === 1
                        ? 'lg:col-span-7'
                        : 'lg:col-span-5'
                  }
                >
                  <Picture
                    id={photo.id}
                    alt={photo.alt}
                    sizes={i === 0 ? '100vw' : '(min-width: 1024px) 50vw, 100vw'}
                    ratio={i === 0 ? '16 / 9' : '4 / 3'}
                    priority={i === 0}
                    className="rounded-[var(--radius-image)]"
                  />
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal>
              <NoPhotoPanel label={room.shortName} ratio="16 / 7" />
              <p className="mt-4 max-w-xl text-[0.875rem] text-ink-mute">
                We would rather show you nothing than show you a stock photograph of somebody
                else&rsquo;s building. This room is being photographed properly. In the meantime,
                ask on WhatsApp and reception will send you pictures from the phone.
              </p>
            </Reveal>
          )}

          {room.facilityPhotos && room.facilityPhotos.length > 0 && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {room.facilityPhotos.map((photo, i) => (
                <Reveal as="figure" key={photo.id} delay={i * 60}>
                  <Picture
                    id={photo.id}
                    alt={photo.alt}
                    sizes="(min-width: 640px) 48vw, 100vw"
                    ratio="4 / 3"
                    className="rounded-[var(--radius-image)]"
                  />
                  <figcaption className="mt-3 flex items-start gap-3 text-caption text-ink-mute">
                    <span aria-hidden className="mt-2 h-px w-6 shrink-0 bg-brass" />
                    {photo.caption}
                  </figcaption>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* Description, features, amenities */}
      <Section tone="paper">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-20">
            <div>
              <Reveal>
                <div className="max-w-[62ch] space-y-5 text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
                  {room.description.map((para) => (
                    <p key={para.slice(0, 30)}>{para}</p>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={80} className="mt-12">
                <h2 className="text-[length:var(--text-h3)]">In this room</h2>
                <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {room.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-[0.9375rem] text-ink-soft">
                      <Check className="mt-1 size-4 shrink-0 text-brass" aria-hidden />
                      {feature}
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={120} className="mt-12">
                <h2 className="text-[length:var(--text-h3)]">Included with every stay</h2>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {room.amenities.map((id) => {
                    const amenity = AMENITIES_BY_ID[id]
                    if (!amenity) return null
                    return (
                      <li
                        key={id}
                        className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-2 px-3.5 py-2 text-[0.8125rem] text-ink-soft"
                      >
                        <amenity.icon className="size-3.5 text-brass" aria-hidden />
                        {amenity.label}
                      </li>
                    )
                  })}
                </ul>
              </Reveal>
            </div>

            {/* Sticky facts panel */}
            <Reveal delay={60}>
              <div className="lg:sticky lg:top-28">
                <div className="rounded-[var(--radius-card)] border border-line bg-paper-2 p-7">
                  <p className="flex items-baseline gap-2">
                    <span className="font-display text-[2.5rem] leading-none text-ink tnum">
                      {formatINR(room.price)}
                    </span>
                    <span className="text-[0.8125rem] text-ink-mute">per {room.priceUnit}</span>
                  </p>
                  <p className="mt-2 text-[0.8125rem] text-ink-mute">
                    Direct rate, taxes included, for {room.occupancy.standard}{' '}
                    {room.occupancy.standard === 1 ? 'guest' : 'guests'}.
                    {room.extraPersonPrice
                      ? ` Each additional guest is ${formatINR(room.extraPersonPrice)}.`
                      : ''}
                  </p>

                  <dl className="mt-6 space-y-3 border-t border-line pt-6 text-[0.875rem]">
                    <Row label="Sleeps" value={`${room.occupancy.standard} to ${room.occupancy.max}`} />
                    <Row label="Bed" value={room.bed} />
                    <Row label="Bathroom" value={room.bathroom} />
                    <Row label="Cooling" value={room.ac ? 'Split AC and fan' : 'Ceiling fan'} />
                    {room.sizeSqft && <Row label="Approx. size" value={`${room.sizeSqft} sq ft`} />}
                    <Row label="Check in" value={`${HOTEL.checkIn}, 24h reception`} />
                    <Row label="Check out" value={HOTEL.checkOut} />
                  </dl>

                  <p className="mt-6 border-t border-line pt-6 text-[0.8125rem] leading-relaxed text-ink-mute">
                    {HOTEL.policies.cancellation}
                  </p>
                </div>

                <div className="mt-6 rounded-[var(--radius-card)] border border-line p-6">
                  <h2 className="text-[0.6875rem] tracking-[0.14em] text-ink-mute uppercase">
                    Walking distance
                  </h2>
                  <ul className="mt-4 space-y-2.5 text-[0.875rem]">
                    {walkable.map((place) => (
                      <li key={place.id} className="flex items-baseline justify-between gap-3">
                        <span className="text-ink-soft">{place.name}</span>
                        <span className="shrink-0 text-ink-mute tnum">{place.walkMinutes} min</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/location"
                    className="mt-5 inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-ink"
                  >
                    Directions and transport
                    <ArrowUpRight className="size-3.5 text-brass" aria-hidden />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* Other rooms */}
      <Section tone="sand" labelledBy="other-rooms">
        <div className="container-page">
          <h2 id="other-rooms" className="text-[length:var(--text-h2)]">
            The other four
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((other, i) => (
              <Reveal as="li" key={other.slug} delay={i * 60}>
                <Link
                  href={`/rooms/${other.slug}`}
                  className="group block overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper transition-all duration-500 ease-[var(--ease-swift)] hover:-translate-y-1 hover:shadow-[var(--shadow-card)]"
                >
                  {other.photos[0] ? (
                    <Picture
                      id={other.photos[0].id}
                      alt={other.photos[0].alt}
                      sizes="(min-width: 1024px) 24vw, 45vw"
                      ratio="4 / 3"
                      className="transition-transform duration-[1100ms] group-hover:scale-[1.05]"
                    />
                  ) : (
                    <NoPhotoPanel label={other.shortName} />
                  )}
                  <div className="p-5">
                    <p className="text-[1.0625rem] font-display text-ink">{other.shortName}</p>
                    <p className="mt-1 text-[0.8125rem] text-ink-mute tnum">
                      from {formatINR(other.price)}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>

          <Link
            href="/rooms"
            className="mt-10 inline-flex items-center gap-2 text-[0.875rem] font-medium text-ink"
          >
            <ArrowLeft className="size-4 text-brass" aria-hidden />
            Back to all rooms and the comparison table
          </Link>
        </div>
      </Section>

      <Faqs
        items={roomFaqs}
        eyebrow="Before you book"
        heading={`Questions about the ${room.shortName}`}
        lead="If it is not answered here, WhatsApp reception. Somebody replies within a few minutes, at any hour."
        tone="paper"
      />
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink-mute">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  )
}
