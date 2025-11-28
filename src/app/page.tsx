import {Suspense} from 'react'

import {Skeleton} from '~/ui/skeleton'
import Container from '~/global/container'
import Hero from '~/index/hero'
import StatsGenerator from '~/index/stats-generator'

export default function IndexPage() {
  return (
    <Container>
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-[10vh]" />
            <Skeleton className="h-[20vh]" />
          </div>
        }
      >
        <Hero />
        <StatsGenerator />
      </Suspense>
    </Container>
  )
}
