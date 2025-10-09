import {BOX} from '~/global/container'

import {cn} from '@/lib/utils'

import {SMALL} from '~/ui/typography'

export default function Header() {
  return (
    <header className={cn(BOX.container, 'flex items-center justify-between')}>
      <SMALL className="text-muted-foreground">
        xstats <br /> for sui community
      </SMALL>
    </header>
  )
}
