export {metadata} from '@/lib/layout-config'
import {geistSans, geistMono} from '@/lib/layout-config'
import '@/app/globals.css'

import {cn} from '@/lib/utils'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={cn([geistSans.variable, geistMono.variable], 'bg-background text-foreground', 'tracking-tight antialiased')}>{children}</body>
    </html>
  )
}
