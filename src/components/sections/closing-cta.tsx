import { Clock, ShieldCheck, Wallet } from 'lucide-react'
import { CallAction, WhatsAppAction } from '@/components/booking/actions'
import { Magnetic } from '@/components/motion/magnetic'
import { Reveal } from '@/components/motion/reveal'
import { Picture } from '@/components/media/picture'
import { HOTEL } from '@/content/hotel'
import { formatINR, LOWEST_RATE } from '@/content/rooms'

/**
 * Closing call to action.
 *
 * The three reassurances sit next to the button rather than in a policies page
 * because the objections they answer (will I be charged now, what if my plans
 * change, is anyone there at 2am) are the last three thoughts before someone
 * either taps or leaves. Answering an objection two clicks away is the same as
 * not answering it.
 */
export function ClosingCta() {
  const reassurances = [
    { icon: Wallet, text: 'Nothing charged now. Pay by cash or UPI at the desk.' },
    { icon: Clock, text: 'Free cancellation until 24 hours before check-in.' },
    { icon: ShieldCheck, text: 'A person replies on WhatsApp, usually within five minutes.' },
  ]

  return (
    <section className="relative isolate overflow-hidden bg-forest-2">
      <div className="absolute inset-0 -z-10">
        <Picture
          id="hero1"
          alt=""
          sizes="100vw"
          className="h-full w-full opacity-30"
          focal="50% 55%"
        />
        <div aria-hidden className="absolute inset-0 bg-forest-2/75" />
      </div>

      <div className="container-page py-[var(--spacing-section)]">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="eyebrow text-brass-2">
              <span aria-hidden className="h-px w-6 bg-current opacity-60" />
              Book direct
              <span aria-hidden className="h-px w-6 bg-current opacity-60" />
            </p>
          </Reveal>

          <Reveal delay={70}>
            <h2 className="mt-6 text-[length:var(--text-h1)] text-white">
              Tell us when you are arriving.
            </h2>
          </Reveal>

          <Reveal delay={130}>
            <p className="mt-6 text-[length:var(--text-lead)] leading-relaxed text-white/80">
              Rooms from {formatINR(LOWEST_RATE)}. Direct is normally cheaper than{' '}
              {HOTEL.otas.join(', ')}, because there is no commission in it. Send us your dates and
              you will have a confirmed room in a few minutes.
            </p>
          </Reveal>

          <Reveal delay={190} className="mt-10 flex flex-wrap justify-center gap-3">
            <Magnetic>
              <WhatsAppAction source="closing_cta" size="lg" />
            </Magnetic>
            <Magnetic>
              <CallAction source="closing_cta" size="lg" variant="onDarkOutline">
                Call {HOTEL.contact.phoneDisplay}
              </CallAction>
            </Magnetic>
          </Reveal>

          <Reveal delay={250}>
            <ul className="mx-auto mt-12 grid max-w-xl gap-4 text-left sm:grid-cols-3">
              {reassurances.map((item) => (
                <li key={item.text} className="flex gap-3 sm:flex-col sm:gap-2.5">
                  <item.icon className="size-4 shrink-0 text-brass-2" aria-hidden />
                  <span className="text-[0.8125rem] leading-relaxed text-white/70">{item.text}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
