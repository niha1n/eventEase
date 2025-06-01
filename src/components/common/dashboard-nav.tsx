"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Calendar,
    LayoutDashboard,
    LogOut,
    Settings,
    Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions";
import { useState, useEffect } from "react";
import { LoadingIndicator } from "@/components/ui/loading-screen";

export default function DashboardNav() {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        async function loadUserRole() {
            try {
                const response = await fetch('/api/dashboard');
                const data = await response.json();
                setUserRole(data.userWithRole?.role);
            } catch (error) {
                console.error('Failed to load user role:', error);
            }
        }
        loadUserRole();
    }, []);

    const navItems = [
        {
            title: "Dashboard",
            href: "/dashboard",
            icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
            title: "Events",
            href: "/dashboard/events",
            icon: <Calendar className="h-5 w-5" />,
        },
        {
            title: "Profile",
            href: "/dashboard/profile",
            icon: <Settings className="h-5 w-5" />,
        },
        // Only show admin section for admin users
        ...(userRole === "ADMIN" ? [{
            title: "Admin",
            href: "/dashboard/admin",
            icon: <Users className="h-5 w-5" />,
        }] : []),
    ];

    const handleNavigation = async (href: string) => {
        setIsLoading(href);
        try {
            await router.prefetch(href);
            router.push(href);
        } finally {
            setIsLoading(null);
        }
    };

    // Check if we're in mobile view by checking if the parent has md:hidden class
    const isMobile = typeof document !== 'undefined' &&
        document.querySelector('.md\\:hidden')?.contains(document.activeElement);

    return (
        <>
            {/* Desktop Navigation */}
            <div className="hidden md:flex h-full flex-col gap-2 p-4">
                <nav className="grid gap-1 px-2">
                    {navItems.map((item) => (
                        <Button
                            key={item.href}
                            variant="ghost"
                            className={cn(
                                "w-full justify-start relative",
                                pathname === item.href ? "bg-accent" : "hover:bg-accent/50",
                                isLoading === item.href && "opacity-50"
                            )}
                            onClick={() => handleNavigation(item.href)}
                            disabled={isLoading !== null}
                        >
                            {isLoading === item.href ? (
                                <LoadingIndicator className="absolute left-3" />
                            ) : (
                                item.icon
                            )}
                            <span className={cn("ml-3", isLoading === item.href && "opacity-0")}>
                                {item.title}
                            </span>
                        </Button>
                    ))}
                </nav>
                <div className="mt-auto">
                    <form action={signOut}>
                        <Button
                            variant="ghost"
                            className="w-full justify-start px-3 relative"
                            type="submit"
                            disabled={isLoading !== null}
                        >
                            {isLoading === "logout" ? (
                                <LoadingIndicator className="absolute left-3" />
                            ) : (
                                <LogOut className="mr-3 h-5 w-5" />
                            )}
                            <span className={cn(isLoading === "logout" && "opacity-0")}>
                                Logout
                            </span>
                        </Button>
                    </form>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex w-full">
                <nav className="flex w-full items-center justify-around">
                    {navItems.map((item) => (
                        <Button
                            key={item.href}
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "flex flex-col items-center gap-1 px-2 py-1 relative",
                                pathname === item.href ? "bg-accent" : "hover:bg-accent/50",
                                isLoading === item.href && "opacity-50"
                            )}
                            onClick={() => handleNavigation(item.href)}
                            disabled={isLoading !== null}
                        >
                            {isLoading === item.href ? (
                                <LoadingIndicator className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            ) : (
                                item.icon
                            )}
                            <span className={cn(
                                "text-xs",
                                isLoading === item.href && "opacity-0"
                            )}>
                                {item.title}
                            </span>
                        </Button>
                    ))}
                </nav>
            </div>
        </>
    );
}