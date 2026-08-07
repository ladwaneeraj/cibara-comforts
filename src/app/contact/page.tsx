import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import type { Metadata } from 'next'
import { CallAction, DirectionsAction, WhatsAppAction } from '@/components/booking/actions'
import { PageHeader } from '@/components/layout/page-header'
import { EnquiryForm } from '@/components/booking/enquiry-form'
import { Reveal } from '@/components/motion/reveal'
import { MapEmbed } from '@/components/sections/map-embed'
import { Section } from '@/components/ui/section'
import { InstagramIcon } from '@/components/ui/brand-icons'
import { FULL_ADDRESS, HOTEL } from '@/content/hotel'
import { breadcrumbNode, jsonLdGraph } from '@/lib/schema'
import { pageMetadata } from '@/lib/seo'

const CRUMBS = [
  { name: 'Home', path: '/' },
  { name: 'Contact', path: '/contact' },
]

export const metadata: Metadata = pageMetadata({
  title: 'Contact and Reception',
  description: `Contact ${HOTEL.name}, Harihar. WhatsApp ${HOTEL.contact.phoneDisplay} for a reply in minutes, or call reception any hour. Near KSRTC Bus Stand, Harihar 577601.`,
  path: '/contact',
})

export default function ContactPage() {
  const channels = [
    {
      icon: Phone,
      label: 'WhatsApp',
      value: HOTEL.contact.phoneDisplay,
      note: 'Fastest. Usually answered within five minutes, at any hour.',
    },
    {
      icon: Phone,
      label: 'Reception, direct line',
      value: HOTEL.contact.receptionDisplay,
      note: 'Staffed 24 hours a day, every day of the year.',
    },
    {
      icon: Mail,
      label: 'Email',
      value: HOTEL.contact.email,
      note: 'For invoices, corporate accounts and anything that needs a paper trail.',
    },
    {
      icon: MapPin,
      label: 'Address',
      value: FULL_ADDRESS,
      note: '800 metres from Harihar railway station, 750 from the KSRTC bus stand.',
    },
    {
      icon: Clock,
      label: 'Check in and out',
      value: `${HOTEL.checkIn} in, ${HOTEL.checkOut} out`,
      note: 'Late check-in is normal and free. Early check-in usually possible if the room is empty.',
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdGraph(breadcrumbNode(CRUMBS)) }}
      />

      <PageHeader
        crumbs={CRUMBS}
        eyebrow="Reception, 24 hours"
        titleLines={['Talk to a person,', 'not a booking engine']}
        lead="There is no call centre and no chatbot. Messages go to the desk, and the desk is staffed by people who work here."
      >
        <div className="flex flex-wrap gap-3">
          <WhatsAppAction source="contact_page" size="lg" />
          <CallAction source="contact_page" size="lg" />
          <DirectionsAction source="contact_page" size="lg" />
        </div>
      </PageHeader>

      <Section tone="paper">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <h2 className="text-[length:var(--text-h2)]">Every way to reach us</h2>
              <dl className="mt-10 divide-y divide-line border-y border-line">
                {channels.map((channel) => (
                  <div key={channel.label} className="flex gap-5 py-5">
                    <channel.icon className="mt-1 size-5 shrink-0 text-brass" aria-hidden />
                    <div>
                      <dt className="text-[0.6875rem] tracking-[0.14em] text-ink-mute uppercase">
                        {channel.label}
                      </dt>
                      <dd className="mt-1.5 text-[1.0625rem] text-ink">{channel.value}</dd>
                      <dd className="mt-1 text-[0.8125rem] leading-relaxed text-ink-mute">
                        {channel.note}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>

              <a
                href={HOTEL.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-[0.875rem] text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
              >
                <InstagramIcon className="size-4" />
                @cibara_comforts
              </a>
            </div>

            <Reveal delay={80}>
              <EnquiryForm />
            </Reveal>
          </div>
        </div>
      </Section>

      <Section tone="sand" className="!py-0">
        <MapEmbed className="!rounded-none !border-x-0 aspect-[4/3] w-full lg:aspect-[21/8]" />
      </Section>
    </>
  )
}
