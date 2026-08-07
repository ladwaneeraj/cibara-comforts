import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Tailwind-aware class merge. Later classes win conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
