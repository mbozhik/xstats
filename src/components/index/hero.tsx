'use client'

import {useCommunity} from '@/hooks/use-community'

import Link from 'next/link'
import {H1, SPAN} from '~/ui/typography'

export default function Hero() {
  const {communityUsername, isLoading, error, isValid} = useCommunity()

  if (isLoading) {
    return (
      <section data-section="hero-index" className="text-center space-y-2">
        <H1>Generate Your X Card</H1>
        <SPAN className="text-muted-foreground">Loading community...</SPAN>
      </section>
    )
  }

  if (error || !isValid) {
    return (
      <section data-section="hero-index" className="text-center space-y-2">
        <H1>Invalid Community</H1>
        <SPAN className="text-muted-foreground line-clamp-1">{error || 'The specified community does not exist'}</SPAN>
      </section>
    )
  }

  return (
    <section data-section="hero-index" className="text-center space-y-2">
      <H1>Generate Your X Card</H1>

      <SPAN className="text-muted-foreground">
        Discover your X impact with{' '}
        <Link href={`https://x.com/${communityUsername}`} target="_blank" className="font-medium text-foreground border-b border-transparent hover:border-foreground duration-300" rel="noopener noreferrer">
          @{communityUsername}
        </Link>
      </SPAN>
    </section>
  )
}
