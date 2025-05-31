// app/layout.tsx
import '@/app/globals.css'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Toaster } from '@/components/ui/sonner'

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
    <html lang="en" className="scroll-smooth">
      <body className={`h-screen bg-background font-sans antialiased ${inter.variable}`}>

        {/* Sonner toast provider */}
        <Toaster richColors position="top-right" closeButton />

        <div className="flex flex-col min-h-screen">
          {/* <Navbar /> */}
          <main className="flex-1 container mx-auto px-4 py-6">
          <Navbar />
            {children}
          </main>
          <Toaster/>
          <Footer />
        </div>
      </body>
    </html>
  )
}
