import {cn} from '@/lib/utils'

export const BOX = {
  container: 'px-3 py-3.5 max-w-xl mx-auto',
  display: 'flex flex-col gap-4.5',
  offset: 'pt-4 pb-14',
  spacing: 'space-y-1.5',
}

export default function Container({children, className}: {children: React.ReactNode; className?: string}) {
  return <main className={cn(BOX.container, BOX.display, BOX.offset, BOX.spacing, className)}>{children}</main>
}
