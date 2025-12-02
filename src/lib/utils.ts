import {clsx, type ClassValue} from 'clsx'
import {twMerge} from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanXAvatarUrl(url: string | undefined): string | undefined {
  if (!url) return url
  return url.replace('_normal', '')
}

export function getTimeAgo(dateInput: string | number): string {
  const now = new Date()
  const past = new Date(typeof dateInput === 'number' ? dateInput : dateInput)
  const diffMs = now.getTime() - past.getTime()

  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) {
    return 'just now'
  } else if (diffMinutes < 60) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`
  } else if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`
  } else {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`
  }
}
