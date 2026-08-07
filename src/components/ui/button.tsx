import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * Button.
 *
 * Sizes are set by minimum touch target rather than by font size: the base
 * size is 48px tall, which clears the WCAG 2.2 target-size minimum and the
 * thumb-reach guidance for one-handed phone use. This property's guests are
 * overwhelmingly on phones, frequently one-handed on a station platform.
 */
const button = cva(
  [
    'relative inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-medium tracking-tight',
    'transition-[background-color,color,border-color,transform,box-shadow] duration-300',
    'ease-[var(--ease-swift)]',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.985]',
    '[&_svg]:shrink-0 [&_svg]:size-[1.15em]',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-ink text-paper hover:bg-forest shadow-[var(--shadow-subtle)] hover:shadow-[var(--shadow-card)]',
        brass:
          'bg-brass text-white hover:bg-brass-3 shadow-[var(--shadow-subtle)] hover:shadow-[var(--shadow-card)] dark:text-forest-2 dark:hover:bg-brass-2',
        outline:
          'border border-line-strong bg-transparent text-ink hover:border-ink hover:bg-ink/[0.03] dark:hover:bg-paper/[0.04]',
        ghost: 'text-ink hover:bg-ink/[0.05] dark:hover:bg-paper/[0.06]',
        // For buttons sitting on a surface that is dark in BOTH themes (the
        // hero, the forest sections). Fixed colours, because `paper` and `ink`
        // invert and would turn this into a dark pill on a dark ground.
        onDark:
          'bg-cream/95 text-forest-2 backdrop-blur-sm hover:bg-cream shadow-[var(--shadow-card)]',
        onDarkOutline:
          'border border-white/30 text-white backdrop-blur-[2px] hover:border-white/70 hover:bg-white/10',
        // WhatsApp brand green, darkened to 5.2:1 against white text. The
        // official #25D366 is 1.7:1 and fails AA badly at any text size.
        whatsapp: 'bg-[#0F7D42] text-white hover:bg-[#0C6B38]',
      },
      size: {
        sm: 'h-10 rounded-full px-4 text-[0.8125rem]',
        base: 'h-12 rounded-full px-6 text-[0.9375rem]',
        lg: 'h-[3.375rem] rounded-full px-8 text-base',
        icon: 'size-11 rounded-full',
      },
    },
    defaultVariants: { variant: 'primary', size: 'base' },
  },
)

export type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof button> & {
    /** Render as the child element, e.g. a next/link. */
    asChild?: boolean
  }

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(button({ variant, size }), className)} {...props} />
}

export { button as buttonVariants }
