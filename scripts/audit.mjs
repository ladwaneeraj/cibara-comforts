/**
 * Pre-flight audit of the static export.
 *
 * Runs against `out/` rather than a dev server, so it checks the bytes that
 * will actually be deployed. Catches the failures that a type checker cannot:
 * a missing alt attribute, a heading level skipped, a JSON-LD block that does
 * not parse, a broken internal link, an oversized page.
 *
 *   npm run build && npx serve out & && npm run audit
 *
 * Exits non-zero on any error-level finding, so it can gate a deploy.
 */
import { chromium } from 'playwright'
import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const BASE = process.env.BASE ?? 'http://127.0.0.1:4321'
const OUT = 'out'

const errors = []
const warnings = []
const fail = (page, msg) => errors.push(`${page}: ${msg}`)
const warn = (page, msg) => warnings.push(`${page}: ${msg}`)

/** Every prerendered route, discovered from the export rather than hardcoded. */
async function routes(dir = OUT, prefix = '/') {
  const found = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'media' || entry.name === 'og') continue
      found.push(...(await routes(full, `${prefix}${entry.name}/`)))
    } else if (entry.name === 'index.html') {
      found.push(prefix)
    }
  }
  return found.sort()
}

const all = await routes()
console.log(`Auditing ${all.length} routes at ${BASE}\n`)

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const internalLinks = new Set()

for (const route of all) {
  const page = await context.newPage()
  const consoleErrors = []
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()))
  page.on('pageerror', (e) => consoleErrors.push(String(e)))

  const response = await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' })
  if (!response?.ok()) {
    fail(route, `HTTP ${response?.status()}`)
    await page.close()
    continue
  }

  const report = await page.evaluate(() => {
    const q = (sel) => [...document.querySelectorAll(sel)]

    return {
      title: document.title,
      titleLength: document.title.length,
      description: document.querySelector('meta[name="description"]')?.content ?? '',
      canonical: document.querySelector('link[rel="canonical"]')?.href ?? '',
      ogImage: document.querySelector('meta[property="og:image"]')?.content ?? '',
      lang: document.documentElement.lang,
      h1s: q('h1').map((h) => h.textContent?.trim().slice(0, 60)),
      headings: q('h1,h2,h3,h4,h5,h6').map((h) => Number(h.tagName[1])),
      imagesMissingAlt: q('img')
        .filter((i) => i.getAttribute('alt') === null)
        .map((i) => i.currentSrc || i.src),
      imagesMissingDims: q('img')
        .filter((i) => !i.getAttribute('width') || !i.getAttribute('height'))
        .map((i) => i.src),
      buttonsWithoutLabel: q('button')
        .filter(
          (b) =>
            !b.textContent?.trim() &&
            !b.getAttribute('aria-label') &&
            !b.getAttribute('aria-labelledby') &&
            !b.querySelector('.sr-only'),
        ).length,
      linksWithoutText: q('a')
        .filter(
          (a) =>
            !a.textContent?.trim() &&
            !a.getAttribute('aria-label') &&
            !a.getAttribute('aria-labelledby'),
        )
        .map((a) => a.getAttribute('href')),
      inputsWithoutLabel: q('input,select,textarea')
        .filter((el) => {
          if (el.type === 'hidden') return false
          if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')) return false
          return !(el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`))
        })
        .map((el) => el.name || el.type),
      jsonLd: q('script[type="application/ld+json"]').map((s) => s.textContent ?? ''),
      internalHrefs: q('a[href^="/"]').map((a) => a.getAttribute('href')),
      hasSkipLink: Boolean(document.querySelector('a[href="#main"]')),
      hasMain: Boolean(document.querySelector('main')),
      viewportBlocksZoom: /user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b/.test(
        document.querySelector('meta[name="viewport"]')?.content ?? '',
      ),
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    }
  })

  // --- SEO ---------------------------------------------------------------
  if (!report.title) fail(route, 'no <title>')
  else if (report.titleLength > 65) warn(route, `title is ${report.titleLength} chars (>65 truncates)`)
  if (!report.description) fail(route, 'no meta description')
  else if (report.description.length > 165)
    warn(route, `meta description is ${report.description.length} chars`)
  if (!report.canonical) fail(route, 'no canonical link')
  if (!report.ogImage) warn(route, 'no og:image')
  if (report.lang !== 'en-IN') fail(route, `html lang is "${report.lang}"`)

  // --- Structure and accessibility ---------------------------------------
  if (report.h1s.length !== 1) fail(route, `${report.h1s.length} <h1> elements`)
  let previous = 0
  for (const level of report.headings) {
    if (previous && level > previous + 1) {
      warn(route, `heading jumps from h${previous} to h${level}`)
      break
    }
    previous = level
  }
  if (report.imagesMissingAlt.length) fail(route, `${report.imagesMissingAlt.length} img without alt`)
  if (report.imagesMissingDims.length)
    warn(route, `${report.imagesMissingDims.length} img without width/height (CLS risk)`)
  if (report.buttonsWithoutLabel) fail(route, `${report.buttonsWithoutLabel} unlabelled button(s)`)
  if (report.linksWithoutText.length)
    fail(route, `${report.linksWithoutText.length} link(s) with no accessible name`)
  if (report.inputsWithoutLabel.length)
    fail(route, `unlabelled form controls: ${report.inputsWithoutLabel.join(', ')}`)
  if (!report.hasSkipLink) fail(route, 'no skip link')
  if (!report.hasMain) fail(route, 'no <main> landmark')
  if (report.viewportBlocksZoom) fail(route, 'viewport blocks pinch zoom (WCAG 1.4.4)')
  if (report.horizontalOverflow) fail(route, 'horizontal overflow at 1280px')

  // --- Structured data ---------------------------------------------------
  if (report.jsonLd.length === 0) warn(route, 'no JSON-LD')
  for (const [i, block] of report.jsonLd.entries()) {
    try {
      const parsed = JSON.parse(block)
      const nodes = parsed['@graph'] ?? [parsed]
      for (const node of nodes) {
        if (!node['@type']) fail(route, `JSON-LD block ${i} has a node with no @type`)
      }
    } catch (e) {
      fail(route, `JSON-LD block ${i} does not parse: ${e.message}`)
    }
  }

  for (const href of report.internalHrefs) internalLinks.add(href.split('#')[0])

  if (consoleErrors.length) fail(route, `console errors: ${consoleErrors.slice(0, 2).join(' | ')}`)

  await page.close()
}

// --- Internal links resolve to a real file ---------------------------------
for (const href of internalLinks) {
  if (!href || href.startsWith('//')) continue
  const clean = href.split('?')[0]
  if (/\.(xml|txt|jpg|png|svg|webmanifest|ico)$/.test(clean)) continue
  const target = path.join(OUT, clean, 'index.html')
  try {
    await stat(target)
  } catch {
    fail('internal links', `${href} does not exist in the export`)
  }
}

// --- Weight ----------------------------------------------------------------
async function dirSize(dir) {
  let total = 0
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    total += entry.isDirectory() ? await dirSize(full) : (await stat(full)).size
  }
  return total
}

const jsSize = await dirSize(path.join(OUT, '_next', 'static'))
const homeHtml = (await readFile(path.join(OUT, 'index.html'))).length
console.log(`Homepage HTML: ${(homeHtml / 1024).toFixed(0)} KB`)
console.log(`_next/static total: ${(jsSize / 1024 / 1024).toFixed(2)} MB (all routes, cached)\n`)

// --- Robots and sitemap ----------------------------------------------------
const sitemap = await readFile(path.join(OUT, 'sitemap.xml'), 'utf8')
const urlCount = (sitemap.match(/<loc>/g) ?? []).length
if (urlCount < all.length - 2) warn('sitemap.xml', `${urlCount} urls for ${all.length} routes`)
console.log(`sitemap.xml: ${urlCount} urls`)
for (const file of ['robots.txt', 'llms.txt', 'CNAME', '.nojekyll', 'og/default.jpg']) {
  try {
    await stat(path.join(OUT, file))
  } catch {
    fail('export', `missing ${file}`)
  }
}

await browser.close()

console.log()
for (const w of warnings) console.log(`  WARN  ${w}`)
for (const e of errors) console.log(`  FAIL  ${e}`)
console.log(`\n${errors.length} errors, ${warnings.length} warnings across ${all.length} routes`)
process.exit(errors.length > 0 ? 1 : 0)
