/**
 * Razorpay Checkout.js, loaded on demand.
 *
 * Deliberately a script tag injected at the moment a guest is about to pay, not
 * an npm import and not a tag in the page head: the library is third-party
 * JavaScript that no visitor needs until they reach the pay step, so it costs
 * every other visit nothing. See the note on deferred third-party code in
 * lib/analytics.ts.
 */

const SRC = 'https://checkout.razorpay.com/v1/checkout.js'

export type RazorpayOptions = {
  key: string
  order_id: string
  /** Paise. Razorpay takes the real amount from the order; this is display only. */
  amount: number
  currency: 'INR'
  name: string
  description?: string
  prefill?: { name?: string; contact?: string; email?: string }
  /**
   * Fires when the browser reports a successful payment. This is a UX signal
   * ONLY. A booking is confirmed by the server-side webhook, never by this.
   */
  handler: () => void
  modal?: { ondismiss?: () => void }
}

type RazorpayConstructor = new (options: RazorpayOptions) => { open: () => void }

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor
  }
}

let pending: Promise<RazorpayConstructor> | null = null

export function loadRazorpay(): Promise<RazorpayConstructor> {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'))
  if (window.Razorpay) return Promise.resolve(window.Razorpay)
  if (pending) return pending

  pending = new Promise<RazorpayConstructor>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SRC
    script.async = true
    script.onload = () => {
      if (window.Razorpay) resolve(window.Razorpay)
      else {
        pending = null
        reject(new Error('Razorpay did not initialise'))
      }
    }
    script.onerror = () => {
      // Allow a retry; a blocked or offline load must not wedge the widget.
      pending = null
      script.remove()
      reject(new Error('Razorpay failed to load'))
    }
    document.head.appendChild(script)
  })
  return pending
}
