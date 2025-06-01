import '@/app/globals.css'
import { cn } from '@/lib/utils'
import { Toaster } from 'sonner'
import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppFooter } from '@/components/layout/app-footer'

export const metadata = {
    title: 'EventEase',
    description: 'Effortless event management with powerful tools.',
}

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className={cn("min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted")}>
            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <Calendar className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold">EventEase</span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <Link href="/sign-in">
                                    Login
                                </Link>
                            </Button>
                            <Button
                                size="sm"
                                asChild
                            >
                                <Link href="/sign-up">
                                    Sign up
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-[400px]">
                    {children}
                </div>
            </main>

            {/* <Toaster /> */}
        </div>
    )
}
