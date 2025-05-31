import '@/app/globals.css'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
import { Toaster } from 'sonner'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
    title: 'EventEase',
    description: 'Effortless event management with powerful tools.',
}

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="scroll-smooth">
            <body
                className={cn(
                    'h-screen bg-background font-sans antialiased',
                    inter.variable
                )}
            >
                {/* Sonner toast provider */}
                <Toaster richColors position="top-right" closeButton />

                <div className="flex min-h-screen flex-col items-center justify-center">
                    {/* Logo/Brand */}
                    <Link href="/" className="mb-8">
                        <h1 className="text-2xl font-bold">EventEase</h1>
                    </Link>

                    {/* Auth Container */}
                    <div className="w-full max-w-md space-y-8 rounded-lg bg-card p-8 ">
                        {children}
                    </div>

                    {/* Footer */}
                    <footer className="mt-8 text-center text-sm text-muted-foreground">
                        © {new Date().getFullYear()} EventEase
                    </footer>
                </div>
            </body>
        </html>
    )
}
