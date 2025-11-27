export {metadata} from '@/lib/layout-config'
import {geistSans, geistMono} from '@/lib/layout-config'
import '@/app/globals.css'

import {cn} from '@/lib/utils'

import {ConvexProvider} from '@/lib/convex'
import {ThemeProvider} from 'next-themes'
import YandexMetrika from '~/global/analytics'

import Header from '~/global/header'
import Footer from '~/global/footer'
import {Toaster} from '~/ui/sonner'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn([geistSans.variable, geistMono.variable], 'min-h-screen flex flex-col', 'bg-background text-foreground', 'tracking-tight antialiased')}>
        <ConvexProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Header />
            {children}
            <Footer />

            <Toaster />
          </ThemeProvider>
        </ConvexProvider>

        {process.env.NODE_ENV === 'production' && <YandexMetrika />}
      </body>
    </html>
  )
}
