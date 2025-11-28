import {Box} from 'lucide-react'

import {BOX} from '~/global/container'

import {cn} from '@/lib/utils'

import Link from 'next/link'
import {SMALL} from '~/ui/typography'

const X_LINKS = {
  BOZZHIK: 'https://x.com/bozzhik',
  SUI_TR_COMMUNITY: 'https://x.com/suitrcommunity',
}

export default function Footer() {
  return (
    <footer className={cn(BOX.container, 'pt-10', 'flex items-center justify-center gap-1.5', 'group')}>
      <Box className="stroke-muted-foreground size-3.5 group-hover:stroke-foreground duration-300" />

      <SMALL className="text-muted-foreground">
        built by{' '}
        <Link href={X_LINKS.BOZZHIK} className="text-foreground border-b border-transparent hover:border-foreground duration-300">
          @bozzhik
        </Link>{' '}
        for{' '}
        <Link href={X_LINKS.SUI_TR_COMMUNITY} className="text-foreground border-b border-transparent hover:border-foreground duration-300">
          @suitrcommunity
        </Link>
      </SMALL>
    </footer>
  )
}
