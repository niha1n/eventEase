import { redirect } from "next/navigation";
import DashboardNav from "@/components/common/dashboard-nav";
import UserAccountNav from "@/components/common/user-account-nav";
import { getAuthenticatedUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { Calendar, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Dashboard | EventEase",
    description: "Manage your events and RSVPs",
};

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getAuthenticatedUser();

    if (!user) {
        redirect("/sign-in");
    }

    // Get user with role from the database
    const userWithRole = await prisma.user.findUnique({
        where: { id: user.user.id },
        select: { role: true, name: true, email: true },
    });

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/"
                            className="flex items-center gap-2 font-semibold transition-colors hover:text-primary"
                        >
                            <Calendar className="h-6 w-6 text-primary" />
                            <span className="text-xl">EventEase</span>
                        </Link>
                        <nav className="hidden md:flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-sm font-medium transition-colors hover:text-primary"
                                asChild
                            >
                                <Link href="/dashboard">
                                    <Home className="mr-2 h-4 w-4" />
                                    Home
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-sm font-medium transition-colors hover:text-primary"
                                asChild
                            >
                                <Link href="/dashboard/events">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Events
                                </Link>
                            </Button>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                            <span className="text-sm font-medium">
                                {userWithRole?.name || user.user.email?.split('@')[0] || 'User'}
                            </span>
                            <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-background">
                                {userWithRole?.role.toLowerCase().replace('_', ' ')}
                            </span>
                        </div>
                        <UserAccountNav
                            user={{
                                name: userWithRole?.name || user.user.email?.split('@')[0] || 'User',
                                email: user.user.email || '',
                                role: userWithRole?.role || 'EVENT_OWNER',
                            }}
                        />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1">
                {/* Sidebar - Hidden on mobile */}
                <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-background">
                    <div className="flex-1 overflow-y-auto py-4">
                        <DashboardNav />
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
                    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Navigation - Fixed at bottom */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-2">
                    <nav className="flex items-center justify-around">
                        <DashboardNav />
                    </nav>
                </div>
            </div>
        </div>
    );
}