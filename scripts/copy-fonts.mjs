/**
 * Refreshes src/fonts/*.woff2 from the @fontsource dev dependencies.
 *
 * The font files are committed so that `next build` never needs the network.
 * Run this after bumping @fontsource-variable/fraunces or
 * @fontsource-variable/inter, then commit the result.
 */
import { copyFile, mkdir } from 'node:fs/promises'

const FILES = [
  ['node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2', 'src/fonts/fraunces-latin.woff2'],
  ['node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2', 'src/fonts/inter-latin.woff2'],
]

await mkdir('src/fonts', { recursive: true })
for (const [from, to] of FILES) {
  await copyFile(from, to)
  console.log(`${from} -> ${to}`)
}
