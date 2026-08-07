import { cn } from '@/lib/utils'

/**
 * Wordmark.
 *
 * Set in the display serif with the "C" carrying a brass hairline underneath,
 * which reads as a signature rather than a logo. Text, not an image: it stays
 * crisp at any density, inherits currentColor so it works on both the light
 * paper and the dark hero, costs nothing to load, and is selectable and
 * indexable.
 */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex flex-col leading-none', className)}>
      <span className="font-display text-[1.375rem] tracking-[-0.02em] sm:text-[1.5rem]">
        Cibara
        <span className="ml-[0.14em] font-light opacity-85">Comforts</span>
      </span>
      {!compact && (
        <span className="mt-1 flex items-center gap-1.5 text-[0.625rem] font-medium tracking-[0.2em] uppercase opacity-85">
          <span aria-hidden className="h-px w-4 bg-current" />
          Harihar, Karnataka
        </span>
      )}
    </span>
  )
}
