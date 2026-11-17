'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { sendWebEvent } from '@/lib/web-analytics'

/**
 * First-party page views for the ERP dashboard.
 *
 * Sends one `page_view` on load and on every client-side navigation. Click and
 * conversion events ride along from `track()` (lib/analytics.ts), so this only
 * owns the page-view stream. No-op unless the ERP base URL is configured.
 */
export function WebAnalytics() {
  const pathname = usePathname()
  useEffect(() => {
    sendWebEvent('page_view', { page: pathname })
  }, [pathname])
  return null
}
