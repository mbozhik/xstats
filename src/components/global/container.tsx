import {cn} from '@/lib/utils'

export const CONTAINER = {
  box: 'px-3 py-3.5 max-w-xl mx-auto min-h-screen',
  display: 'flex flex-col gap-4.5',
  offset: 'py-10',
}

export default function Container({children, className}: {children: React.ReactNode; className?: string}) {
  return <main className={cn(CONTAINER.box, CONTAINER.display, CONTAINER.offset, className)}>{children}</main>
}
