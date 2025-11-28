import {clsx, type ClassValue} from 'clsx'
import {twMerge} from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanXAvatarUrl(url: string | undefined): string | undefined {
  if (!url) return url
  return url.replace('_normal', '')
}
