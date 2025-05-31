// app/components/NavbarClient.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { signOut } from '@/lib/actions'

interface NavbarClientProps {
    user: {
        id: string
        name?: string | null
        email: string
        emailVerified: boolean
        image?: string | null
        createdAt: Date
        updatedAt: Date
    } | undefined
}


export default function NavbarClient({ user }: NavbarClientProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <nav className="border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and main nav */}
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="text-xl font-bold text-primary">
                                EventEase
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link href="/events" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900">
                                Events
                            </Link>
                            <Link href="/about" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900">
                                About
                            </Link>
                        </div>
                    </div>

                    {/* Auth buttons */}
                    <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
                        {user ? (
                            <>
                                <form action={signOut}>
                                    <Button type="submit" variant="ghost">
                                        Sign Out
                                    </Button>
                                </form>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" asChild>
                                    <Link href="/sign-in">Login</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/sign-up">Sign Up</Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center sm:hidden">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <span className="sr-only">Open main menu</span>
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link href="/events" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
                            Events
                        </Link>
                        <Link href="/about" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50">
                            About
                        </Link>
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-200">
                        <div className="space-y-1">
                            {user ? (
                                <>
                                    <form action={signOut}>
                                        <Button type="submit" variant="ghost" className="w-full justify-start">
                                            Sign Out
                                        </Button>
                                    </form>
                                </>
                            ) : (
                                <>
                                    <Button variant="ghost" className="w-full justify-start" asChild>
                                        <Link href="/sign-in">Login</Link>
                                    </Button>
                                    <Button className="w-full justify-start" asChild>
                                        <Link href="/sign-up">Sign Up</Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
