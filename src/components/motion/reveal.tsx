import type { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Scroll reveal. A server component with no client JavaScript.
 *
 * This started as a client component with an IntersectionObserver, and that
 * turned out to be the single most expensive decision on the site. Because
 * `Reveal` wraps most sections, marking it `'use client'` forced React to
 * serialise every wrapped subtree into the RSC flight payload: 137 KB of the
 * homepage's 283 KB, duplicating content that was already in the HTML, and
 * paid for again in hydration work on the main thread.
 *
 * The animation itself never needed React. Two CSS paths cover every browser:
 *
 *   1. Where `animation-timeline: view()` is supported, the reveal is driven
 *      by scroll position off the main thread. No JavaScript at all.
 *   2. Everywhere else, one shared IntersectionObserver in an inline script
 *      (see REVEAL_SCRIPT below) toggles a class. Around 400 bytes, no React.
 *
 * Both paths are gated on prefers-reduced-motion, and the fallback path only
 * hides content once the script has confirmed it is running, so a failed or
 * blocked bundle leaves everything visible rather than blank.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  className,
  delay = 0,
}: {
  children: ReactNode
  as?: ElementType
  className?: string
  /** Stagger in milliseconds. Keep the total across a group under ~400ms. */
  delay?: number
}) {
  return (
    <Tag
      className={cn('reveal', className)}
      style={
        delay
          ? ({
              animationDelay: `${delay}ms`,
              transitionDelay: `${delay}ms`,
            } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </Tag>
  )
}

/**
 * Fallback observer, inlined in the document head.
 *
 * Adds `reveal-js` to <html> before first paint so the CSS knows the fallback
 * is live, then reveals elements as they enter. Deliberately one observer for
 * the whole document rather than one per element: with forty-odd revealed
 * blocks on the homepage, per-element observers cost measurable main-thread
 * time on the mid-range Android hardware this site is built for.
 */
export const REVEAL_SCRIPT = `(function(){
try{
if(CSS.supports('animation-timeline: view()'))return;
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var d=document,h=d.documentElement;h.classList.add('reveal-js');
var io=new IntersectionObserver(function(es){for(var i=0;i<es.length;i++){if(es[i].isIntersecting){es[i].target.classList.add('is-in');io.unobserve(es[i].target)}}},{rootMargin:'0px 0px -12% 0px',threshold:0.05});
var start=function(){var n=d.querySelectorAll('.reveal');for(var i=0;i<n.length;i++)io.observe(n[i])};
if(d.readyState!=='loading')start();else d.addEventListener('DOMContentLoaded',start);
}catch(e){}
})()`
