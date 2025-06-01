"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { AnimatedLandingHeader, AnimatedLandingSection, AnimatedFeatureCard } from "@/components/ui/animated";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        setUser(data.user || null);
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="px-4 lg:px-6 h-16 flex items-center border-b">
          <Link href="/" className="flex items-center justify-center">
            <span className="text-xl font-bold">EventEase</span>
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <div className="h-8 w-20 bg-muted animate-pulse rounded" />
          </nav>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="/" className="flex items-center justify-center">
          <span className="text-xl font-bold">EventEase</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          {user ? (
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
      </header>
      <main className="flex-1">
        <AnimatedLandingSection>
          <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex items-center justify-center">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center space-y-4 text-center">
                <AnimatedLandingHeader className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Streamline Your Event Management
                  </h1>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                    Create, manage, and track your events with ease. Collect RSVPs, manage attendees, and more.
                  </p>
                </AnimatedLandingHeader>
                <div className="space-x-4">
                  {user ? (
                    <Button size="lg" asChild>
                      <Link href="/dashboard/events/create">Create an Event</Link>
                    </Button>
                  ) : (
                    <Button size="lg" asChild>
                      <Link href="/sign-up">Get Started</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </section>
        </AnimatedLandingSection>

        <AnimatedLandingSection index={1}>
          <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <AnimatedLandingHeader className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Features</h2>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                    Everything you need to manage your events effectively
                  </p>
                </AnimatedLandingHeader>
                <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
                  <AnimatedFeatureCard index={0} className="grid gap-1">
                    <h3 className="text-xl font-bold">Easy Event Creation</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Create custom events with flexible fields to collect exactly the information you need
                    </p>
                  </AnimatedFeatureCard>
                  <AnimatedFeatureCard index={1} className="grid gap-1">
                    <h3 className="text-xl font-bold">RSVP Management</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Track attendees and export guest lists with a simple interface
                    </p>
                  </AnimatedFeatureCard>
                  <AnimatedFeatureCard index={2} className="grid gap-1">
                    <h3 className="text-xl font-bold">Role-Based Access</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Secure access controls for administrators, staff, and event owners
                    </p>
                  </AnimatedFeatureCard>
                </div>
              </div>
            </div>
          </section>
        </AnimatedLandingSection>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} EventEase. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}