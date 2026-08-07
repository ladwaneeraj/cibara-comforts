/**
 * Build-time image pipeline.
 *
 * Why this exists: the site is deployed as a Next.js static export to GitHub
 * Pages, so there is no Node runtime and therefore no `next/image` optimizer.
 * This script does at build time what that optimizer would have done at
 * request time: responsive derivatives, modern formats, and inline blur
 * placeholders. See docs/ARCHITECTURE.md.
 *
 * Input:  assets/source/*.{jpg,jpeg,png}
 * Output: public/media/<id>/<width>.avif
 *         public/media/<id>/<width>.webp
 *         public/media/<id>/fallback.jpg     (widest JPEG, for <img src>)
 *         src/content/generated/media.ts     (dimensions + LQIP data URIs)
 *
 * Run with `npm run images`. Idempotent: skips work when the source file is
 * older than its generated output, unless FORCE=1.
 */
import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const SOURCE_DIR = 'assets/source'
const OUT_DIR = 'public/media'
const MANIFEST = 'src/content/generated/media.ts'
const FORCE = process.env.FORCE === '1'

/** Widths we emit. A width is skipped when it exceeds the source width. */
const WIDTHS = [420, 640, 828, 1080, 1440, 1920, 2560]

/** Quality per format. AVIF is the primary; WebP is the compatibility path. */
const QUALITY = { avif: 52, webp: 74, jpeg: 82 }

/**
 * AVIF encoder effort. 4 is roughly 5x faster than 6 for a ~3% size penalty,
 * which is the right trade for CI. Set AVIF_EFFORT=9 for a release build.
 */
const AVIF_EFFORT = Number(process.env.AVIF_EFFORT ?? 4)

/** Concurrent source images. sharp already threads internally per image. */
const CONCURRENCY = Number(process.env.IMAGE_CONCURRENCY ?? 4)

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length)
  let cursor = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const i = cursor++
        results[i] = await fn(items[i])
      }
    }),
  )
  return results
}

/**
 * Shared colour grade.
 *
 * The property photographs were shot under mixed tungsten and daylight, which
 * left a magenta cast on the floor tiles and pushed the textile reds past what
 * reads as premium on screen. This pulls saturation back, lifts the shadows
 * slightly, and warms the whites so that images from four different shoots
 * read as one set. Applied before resizing so the grade is resolution
 * independent.
 */
function grade(pipeline) {
  return pipeline
    .modulate({ saturation: 0.85, brightness: 1.03 })
    .linear([1.04, 1.005, 0.94], [2, 3, 6])
    .gamma(1.06)
}

async function newestSourceMTime(file) {
  return (await stat(file)).mtimeMs
}

async function isStale(sourceFile, id) {
  if (FORCE) return true
  try {
    const marker = await stat(path.join(OUT_DIR, id, '.stamp'))
    return (await newestSourceMTime(sourceFile)) > marker.mtimeMs
  } catch {
    return true
  }
}

/** 24px-wide WebP, inlined as a data URI. Typically 300-600 bytes. */
async function makeLqip(buffer) {
  const out = await sharp(buffer)
    .resize(24, null, { fit: 'inside' })
    .webp({ quality: 28, alphaQuality: 40, smartSubsample: true })
    .toBuffer()
  return `data:image/webp;base64,${out.toString('base64')}`
}

/** Average colour, used as the background behind a still-loading image. */
async function dominantColor(buffer) {
  const { data } = await sharp(buffer)
    .resize(1, 1, { fit: 'cover' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const hex = [...data].map((v) => v.toString(16).padStart(2, '0')).join('')
  return `#${hex}`
}

async function processOne(file) {
  const id = path.basename(file, path.extname(file))
  const sourcePath = path.join(SOURCE_DIR, file)
  const graded = await grade(sharp(sourcePath).rotate()).toBuffer()
  const meta = await sharp(graded).metadata()

  const entry = {
    id,
    width: meta.width,
    height: meta.height,
    lqip: await makeLqip(graded),
    color: await dominantColor(graded),
    widths: WIDTHS.filter((w) => w <= meta.width),
  }
  // Always keep at least one width, even for unusually small sources.
  if (entry.widths.length === 0) entry.widths = [meta.width]

  if (!(await isStale(sourcePath, id))) {
    process.stdout.write(`  ${id} (cached)\n`)
    return entry
  }

  const dir = path.join(OUT_DIR, id)
  await mkdir(dir, { recursive: true })

  for (const w of entry.widths) {
    const resized = sharp(graded).resize(w, null, {
      fit: 'inside',
      withoutEnlargement: true,
      kernel: 'lanczos3',
    })
    // Light sharpening after downscale; without it AVIF at low quality reads
    // soft on room detail like the cane discs and tile grout.
    const sharpened = resized.sharpen({ sigma: 0.6, m1: 0.4, m2: 0.7 })
    await Promise.all([
      sharpened.clone().avif({ quality: QUALITY.avif, effort: AVIF_EFFORT }).toFile(path.join(dir, `${w}.avif`)),
      sharpened.clone().webp({ quality: QUALITY.webp, effort: 4 }).toFile(path.join(dir, `${w}.webp`)),
    ])
  }

  const widest = entry.widths[entry.widths.length - 1]
  await sharp(graded)
    .resize(widest, null, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: QUALITY.jpeg, mozjpeg: true, progressive: true })
    .toFile(path.join(dir, 'fallback.jpg'))

  await writeFile(path.join(dir, '.stamp'), '')
  process.stdout.write(`  ${id} ${entry.width}x${entry.height} -> ${entry.widths.length} widths\n`)
  return entry
}

/* --------------------------------------------------------------------------
   Social cards and icons
   --------------------------------------------------------------------------
   OpenGraph cards are cropped photographs, not generated text cards. For a
   hotel that is the better choice on the merits: a real room photograph earns
   more clicks in a WhatsApp or Facebook preview than a typeset card, and it
   removes the font dependency that `next/og` would add to the build.
-------------------------------------------------------------------------- */
const OG = [
  { out: 'default', from: 'hero2', focal: 0.55 },
  { out: 'rooms', from: 'premium3', focal: 0.5 },
  { out: 'gallery', from: 'hero4', focal: 0.5 },
  { out: 'location', from: 'hero1', focal: 0.55 },
]

async function buildOgCards() {
  await mkdir('public/og', { recursive: true })
  for (const card of OG) {
    const source = (await readdir(SOURCE_DIR)).find((f) => path.basename(f, path.extname(f)) === card.from)
    if (!source) continue
    await grade(sharp(path.join(SOURCE_DIR, source)).rotate())
      .resize(1200, 630, { fit: 'cover', position: sharp.strategy.attention })
      .jpeg({ quality: 84, mozjpeg: true })
      .toFile(`public/og/${card.out}.jpg`)
  }
  // One card per room, so a shared room link previews that actual room.
  const roomsFile = await readFile('src/content/rooms.ts', 'utf8')
  const pairs = [...roomsFile.matchAll(/slug:\s*'([^']+)'[\s\S]*?photos:\s*\[\s*\{\s*id:\s*'([^']+)'/g)]
  for (const [, slug, id] of pairs) {
    const source = (await readdir(SOURCE_DIR)).find((f) => path.basename(f, path.extname(f)) === id)
    if (!source) continue
    await grade(sharp(path.join(SOURCE_DIR, source)).rotate())
      .resize(1200, 630, { fit: 'cover', position: sharp.strategy.attention })
      .jpeg({ quality: 84, mozjpeg: true })
      .toFile(`public/og/room-${slug}.jpg`)
  }
  console.log(`Wrote ${OG.length + pairs.length} OpenGraph cards`)
}

/**
 * Favicon and app icons, rendered from one SVG monogram so every size is
 * pixel-consistent. The mark is a Fraunces-flavoured C in brass on the forest
 * green, which is the same pairing the site header uses.
 */
const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Cibara Comforts">
  <rect width="64" height="64" rx="14" fill="#16241C"/>
  <path d="M42.4 22.6c-2.2-2.9-5.5-4.6-9.3-4.6-7.1 0-12.4 5.8-12.4 13.9S26 45.9 33.1 45.9c3.9 0 7.2-1.7 9.4-4.7" fill="none" stroke="#C9A97C" stroke-width="4.2" stroke-linecap="round"/>
  <circle cx="45.6" cy="32" r="2.6" fill="#C9A97C"/>
</svg>`

async function buildIcons() {
  await writeFile('public/icon.svg', ICON_SVG)
  const svg = Buffer.from(ICON_SVG)
  await sharp(svg, { density: 384 }).resize(180, 180).png().toFile('public/apple-touch-icon.png')
  await sharp(svg, { density: 384 }).resize(512, 512).png().toFile('public/icon-512.png')
  await sharp(svg, { density: 384 }).resize(192, 192).png().toFile('public/icon-192.png')
  // Multi-size .ico is not worth a dependency; a 48px PNG named .ico is
  // accepted by every browser that still asks for /favicon.ico.
  await sharp(svg, { density: 256 }).resize(48, 48).png().toFile('public/favicon.ico')
  console.log('Wrote icons')
}

async function main() {
  const files = (await readdir(SOURCE_DIR)).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort()
  console.log(`Optimising ${files.length} images`)

  const entries = await mapLimit(files, CONCURRENCY, processOne)

  const byId = Object.fromEntries(entries.map((e) => [e.id, e]))
  const hash = createHash('sha1').update(JSON.stringify(byId)).digest('hex').slice(0, 8)

  await mkdir(path.dirname(MANIFEST), { recursive: true })
  await writeFile(
    MANIFEST,
    `// GENERATED BY scripts/optimize-images.mjs - DO NOT EDIT
// Manifest hash: ${hash}
export type MediaEntry = {
  id: string
  width: number
  height: number
  /** Inline 24px WebP used as the blur-up placeholder. */
  lqip: string
  /** Average colour, painted behind the image before it decodes. */
  color: string
  widths: number[]
}

export const MEDIA = ${JSON.stringify(byId, null, 2)} as const satisfies Record<string, MediaEntry>

export type MediaId = keyof typeof MEDIA
`,
  )

  const sizes = await Promise.all(
    entries.flatMap((e) => e.widths.map((w) => stat(path.join(OUT_DIR, e.id, `${w}.avif`)).then((s) => s.size))),
  )
  const total = sizes.reduce((a, b) => a + b, 0)
  console.log(`Wrote ${MANIFEST} (${entries.length} entries, ${(total / 1024 / 1024).toFixed(1)} MB of AVIF)`)

  await buildOgCards()
  await buildIcons()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
