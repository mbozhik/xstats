export {metadata} from '@/lib/layout-config'
import {geistSans, geistMono} from '@/lib/layout-config'
import '@/app/globals.css'

import {cn} from '@/lib/utils'

import YandexMetrika from '~/global/analytics'

import Header from '~/global/header'
import {Toaster} from '~/ui/sonner'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={cn([geistSans.variable, geistMono.variable], 'bg-background text-foreground', 'tracking-tight antialiased')}>
        <Header />
        {children}

        <Toaster />
        {process.env.NODE_ENV === 'production' && <YandexMetrika />}
      </body>
    </html>
  )
}
