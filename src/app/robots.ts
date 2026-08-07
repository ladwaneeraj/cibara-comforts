import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/content/hotel'

/**
 * robots.txt.
 *
 * Deliberately permissive to the AI crawlers.
 *
 * A boutique hotel with a strong brand might reasonably block GPTBot to
 * protect its content. A budget lodge in a town of a hundred thousand people
 * has the opposite problem: almost nobody knows it exists. When somebody asks
 * an assistant "where should I stay in Harihar", the answer is drawn from what
 * those crawlers were allowed to read. Blocking them removes the property from
 * an answer surface that is growing, in exchange for protecting content that
 * has no resale value.
 *
 * So every major AI crawler is explicitly allowed, and /llms.txt gives them a
 * clean, structured summary to read first.
 */
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Next.js build metadata. No value to a crawler and it wastes budget.
        disallow: ['/_next/', '/404'],
      },
      // Named explicitly so the intent is unambiguous to each operator.
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Claude-Web', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Perplexity-User', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
      { userAgent: 'Bingbot', allow: '/' },
      { userAgent: 'Amazonbot', allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
