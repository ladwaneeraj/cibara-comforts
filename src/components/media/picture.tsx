import { MEDIA, type MediaId } from '@/content/generated/media'
import { cn } from '@/lib/utils'

/**
 * Responsive image.
 *
 * Replaces `next/image`, which is unavailable on a static export with no Node
 * runtime. This renders a plain `<picture>` against derivatives produced by
 * scripts/optimize-images.mjs, so it ships zero client JavaScript and still
 * gets AVIF with a WebP fallback, a full srcset, correct intrinsic dimensions,
 * and a blur-up placeholder.
 *
 * The placeholder is a 24px WebP inlined as a background image plus the
 * image's average colour underneath. Because it is pure CSS, the blur-up works
 * before hydration and on a failed JS load, which is exactly when a guest on a
 * 3G connection in Harihar most needs it.
 *
 * `sizes` is required in practice. Getting it wrong is the single most common
 * cause of a browser downloading a 1920px file into a 380px slot, so callers
 * should state the real rendered width.
 */
type PictureProps = {
  id: MediaId
  alt: string
  /** CSS `sizes`. Describe the rendered width, not the source width. */
  sizes?: string
  /**
   * Set on the LCP image only. Adds fetchpriority=high and eager loading, and
   * requires a matching <link rel=preload> from the page.
   */
  priority?: boolean
  /** Crop to this aspect ratio. Omit to use the image's own ratio. */
  ratio?: number | string
  /** CSS object-position, for art-directing the crop. */
  focal?: string
  className?: string
  /** Applied to the <img> itself rather than the wrapper. */
  imgClassName?: string
}

export function Picture({
  id,
  alt,
  sizes = '100vw',
  priority = false,
  ratio,
  focal = '50% 50%',
  className,
  imgClassName,
}: PictureProps) {
  const media = MEDIA[id]
  if (!media) {
    throw new Error(
      `Unknown media id "${id}". Add the source file to assets/source and run \`npm run images\`.`,
    )
  }

  const srcset = (ext: 'avif' | 'webp') =>
    media.widths.map((w) => `/media/${id}/${w}.${ext} ${w}w`).join(', ')

  const aspect = ratio ?? `${media.width} / ${media.height}`

  return (
    <div
      className={cn('relative overflow-hidden bg-no-repeat bg-cover', className)}
      style={{
        aspectRatio: aspect,
        backgroundColor: media.color,
        backgroundImage: `url("${media.lqip}")`,
      }}
    >
      <picture>
        <source type="image/avif" srcSet={srcset('avif')} sizes={sizes} />
        <source type="image/webp" srcSet={srcset('webp')} sizes={sizes} />
        <img
          src={`/media/${id}/fallback.jpg`}
          alt={alt}
          width={media.width}
          height={media.height}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding={priority ? 'sync' : 'async'}
          className={cn('absolute inset-0 h-full w-full object-cover', imgClassName)}
          style={{ objectPosition: focal }}
        />
      </picture>
    </div>
  )
}

/**
 * Preload tag for the LCP image.
 *
 * Rendered into the page body next to the hero rather than into <head>: React
 * hoists `<link rel="preload">` to the head automatically, and keeping it
 * beside the image it describes means the two cannot drift apart.
 */
export function PicturePreload({ id, sizes }: { id: MediaId; sizes: string }) {
  const media = MEDIA[id]
  if (!media) return null
  return (
    <link
      rel="preload"
      as="image"
      type="image/avif"
      imageSrcSet={media.widths.map((w) => `/media/${id}/${w}.avif ${w}w`).join(', ')}
      imageSizes={sizes}
      fetchPriority="high"
    />
  )
}
