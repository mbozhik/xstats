import type {Metadata} from 'next'
import {Geist, Geist_Mono} from 'next/font/google'

export const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'xstats',
  description: 'create and share auto-updating stat cards with metrics from X — followers, tweets, engagement.',
}
