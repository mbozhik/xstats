// 'use client'

// import {SunIcon, MoonIcon} from 'lucide-react'
import {BOX} from '~/global/container'

import {cn} from '@/lib/utils'

// import {useEffect, useState} from 'react'
// import {useTheme} from 'next-themes'

// import {Button} from '~/ui/button'
import {Separator} from '~/ui/separator'
import {SMALL} from '~/ui/typography'

export default function Header() {
  // const {theme, setTheme} = useTheme('dark')
  // const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  // useEffect(() => {
  //   setMounted(true)
  // }, [])

  // const toggleTheme = () => {
  //   setTheme(theme === 'dark' ? 'light' : 'dark')
  // }

  // const ICON_CONFIG = {
  //   className: 'size-4 text-muted-foreground group-hover:text-foreground duration-200',
  //   strokeWidth: 1.7,
  // }

  // if (!mounted) {
  //   return (
  //     <header className={cn(BOX.container, 'flex items-center justify-between')}>
  //       <SMALL className="text-muted-foreground">
  //         <span className="text-foreground">xstats</span> <br /> track your impact
  //       </SMALL>

  //       <div className="size-8" />
  //     </header>
  //   )
  // }

  return (
    <header className={cn(BOX.container, 'py-3 sm:py-2', 'flex flex-col gap-2.5')}>
      <div className="flex items-center justify-between">
        <SMALL className="text-muted-foreground">
          <span className="text-foreground">xstats</span> <br /> track your impact
        </SMALL>

        {/* <Button variant="ghost" size="icon" className="size-8 group" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? <SunIcon {...ICON_CONFIG} /> : <MoonIcon {...ICON_CONFIG} />}
        </Button> */}
      </div>

      <Separator />
    </header>
  )
}
