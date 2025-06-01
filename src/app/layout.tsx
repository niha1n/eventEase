// app/layout.tsx
import '@/app/globals.css'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/sonner'
import { AppFooter } from '@/components/layout/app-footer'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'EventEase',
  description: 'Effortless event management with powerful tools.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={cn('min-h-screen flex flex-col bg-background font-sans antialiased', inter.variable)}>
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <AppFooter />
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  )
}
