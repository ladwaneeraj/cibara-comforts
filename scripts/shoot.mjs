/**
 * Design review screenshots.
 *
 * Renders the built static export at the viewport sizes that matter and writes
 * PNGs to /tmp/shots. Not part of the production build; a review tool.
 *
 *   node scripts/shoot.mjs [path] [--dark] [--full]
 */
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const BASE = process.env.BASE ?? 'http://127.0.0.1:4321'
const target = process.argv[2] ?? '/'
const dark = process.argv.includes('--dark')
const full = process.argv.includes('--full')
const out = '/tmp/shots'

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844, dsf: 2 },
  { name: 'desktop', width: 1440, height: 900, dsf: 1 },
]

await mkdir(out, { recursive: true })
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.dsf,
    colorScheme: dark ? 'dark' : 'light',
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(String(e)))

  await page.goto(`${BASE}${target}`, { waitUntil: 'networkidle' })

  // Scroll the whole page so lazy images actually request, then return to the
  // top. Without this a full-page capture shows blur placeholders below the
  // fold and you end up debugging a screenshot artefact instead of the site.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 120))
    }
    window.scrollTo(0, 0)
    await Promise.all(
      [...document.images].filter((i) => !i.complete).map((i) => i.decode().catch(() => {})),
    )
  })
  await page.waitForTimeout(900)

  const slug = target.replace(/\W+/g, '_') || 'home'
  const file = `${out}/${slug}-${vp.name}${dark ? '-dark' : ''}.png`
  await page.screenshot({ path: file, fullPage: full })
  console.log(file, errors.length ? `ERRORS: ${errors.slice(0, 4).join(' | ')}` : 'clean')
  await context.close()
}

await browser.close()
