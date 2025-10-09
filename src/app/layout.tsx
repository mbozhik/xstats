export {metadata} from '@/lib/layout-config'
import {geistSans, geistMono} from '@/lib/layout-config'
import '@/app/globals.css'

import {cn} from '@/lib/utils'

import {ThemeProvider} from 'next-themes'
import YandexMetrika from '~/global/analytics'

import Header from '~/global/header'
import {Toaster} from '~/ui/sonner'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn([geistSans.variable, geistMono.variable], 'bg-background text-foreground', 'tracking-tight antialiased')}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Header />
          {children}

          <Toaster />
          {process.env.NODE_ENV === 'production' && <YandexMetrika />}
        </ThemeProvider>
      </body>
    </html>
  )
}
