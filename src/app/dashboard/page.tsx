'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, Plus, Users, Eye, TrendingUp, Clock, CalendarCheck, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import EventCard from "@/components/events/event-card";
import DashboardAnalytics from "@/components/analytics/dashboard-analytics";
import { format } from "date-fns";
import {
    AnimatedPage,
    AnimatedCard,
    AnimatedForm,
    AnimatedFormField,
    AnimatedButton,
    AnimatedIcon,
    AnimatedText,
    AnimatedErrorMessage,
    AnimatedDashboardCard,
    AnimatedDashboardSection,
    AnimatedDashboardHeader,
    AnimatedDashboardTabs
} from "@/components/ui/animated";
import { LoadingScreen } from "@/components/ui/loading-screen";

interface Event {
    id: string;
    title: string;
    description: string | null;
    startDate: Date;
    endDate: Date | null;
    status: "past" | "ongoing" | "upcoming";
    daysUntilStart: number;
    daysSinceEnd: number | null;
    isPublished: boolean;
    _count: {
        rsvps: number;
        views: number;
    };
}

interface DashboardData {
    recentEvents: Event[];
    upcomingEvents: Event[];
    categorizedEvents: {
        past: Event[];
        ongoing: Event[];
        upcoming: Event[];
    };
    totalEvents: number;
    publishedEvents: number;
    totalRSVPs: number;
    analytics: {
        totalViews: number;
        totalRSVPs: number;
        conversionRate: number;
        activeEvents: number;
        rsvpTrends: Array<{
            date: string;
            confirmed: number;
            pending: number;
            declined: number;
            total: number;
        }>;
        viewTrends: Array<{
            date: string;
            views: number;
        }>;
        eventStats: Array<{
            id: string;
            title: string;
            views: number;
            rsvps: number;
            conversionRate: number;
        }>;
    };
}

function EventStatusBadge({ status }: { status: Event["status"] }) {
    const statusConfig = {
        past: { label: "Past", icon: CalendarX, className: "bg-muted text-muted-foreground" },
        ongoing: { label: "Ongoing", icon: Clock, className: "bg-green-100 text-green-800" },
        upcoming: { label: "Upcoming", icon: CalendarCheck, className: "bg-blue-100 text-blue-800" },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <Badge variant="secondary" className={config.className}>
            <AnimatedIcon>
                <Icon className="w-3 h-3 mr-1" />
            </AnimatedIcon>
            {config.label}
        </Badge>
    );
}

function EventTimeInfo({ event }: { event: Event }) {
    if (event.status === "upcoming") {
        return (
            <p className="text-sm text-muted-foreground">
                Starts in {event.daysUntilStart} {event.daysUntilStart === 1 ? "day" : "days"}
            </p>
        );
    }
    if (event.status === "past" && event.daysSinceEnd) {
        return (
            <p className="text-sm text-muted-foreground">
                Ended {event.daysSinceEnd} {event.daysSinceEnd === 1 ? "day" : "days"} ago
            </p>
        );
    }
    if (event.status === "ongoing") {
        return (
            <p className="text-sm text-muted-foreground">
                Started {format(new Date(event.startDate), "MMM d, yyyy")}
            </p>
        );
    }
    return null;
}

function EventSection({ title, events, emptyMessage, index }: { title: string; events: Event[]; emptyMessage: string; index: number }) {
    return (
        <AnimatedDashboardSection index={index}>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">{title}</h2>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/events">View All</Link>
                    </Button>
                </div>
                {events.length === 0 ? (
                    <Card className="p-8">
                        <div className="text-center">
                            <p className="text-muted-foreground mb-4">{emptyMessage}</p>
                            <Button asChild>
                                <Link href="/dashboard/events/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Event
                                </Link>
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {events.map((event, eventIndex) => (
                            <AnimatedDashboardCard key={event.id} index={eventIndex}>
                                <Card className="relative overflow-hidden">
                                    <div className="absolute top-2 right-2">
                                        <EventStatusBadge status={event.status} />
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                                        <EventTimeInfo event={event} />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Views</p>
                                                <p className="font-medium">{event._count.views}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">RSVPs</p>
                                                <p className="font-medium">{event._count.rsvps}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <Button variant="outline" className="w-full" asChild>
                                                <Link href={`/event/${event.id}`}>View Details</Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </AnimatedDashboardCard>
                        ))}
                    </div>
                )}
            </div>
        </AnimatedDashboardSection>
    );
}

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch("/api/dashboard");
                if (!response.ok) throw new Error("Failed to fetch dashboard data");
                const data = await response.json();
                setDashboardData(data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
                setTimeout(() => setShowContent(true), 100);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header - Always visible */}
            <AnimatedDashboardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Welcome back! Here's an overview of your events.
                        </p>
                    </div>
                    <Button asChild className="w-full md:w-auto">
                        <Link href="/dashboard/events/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Event
                        </Link>
                    </Button>
                </div>
            </AnimatedDashboardHeader>

            {/* Main Content Area */}
            {loading ? (
                <div className="min-h-[400px] flex items-center justify-center">
                    <LoadingScreen message="Loading your dashboard..." />
                </div>
            ) : !dashboardData ? (
                <div className="min-h-[400px] flex items-center justify-center">
                    <AnimatedText className="text-muted-foreground">Failed to load dashboard data</AnimatedText>
                </div>
            ) : (
                <AnimatedPage className="space-y-8">
                    <AnimatedDashboardTabs>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                            <TabsList>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-8">
                                {/* Summary Cards */}
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    {[
                                        {
                                            title: "Total Events",
                                            value: dashboardData.totalEvents,
                                            subtitle: `${dashboardData.publishedEvents} published`,
                                            icon: Calendar
                                        },
                                        {
                                            title: "Total RSVPs",
                                            value: dashboardData.totalRSVPs,
                                            subtitle: "Across all events",
                                            icon: Users
                                        },
                                        {
                                            title: "Total Views",
                                            value: dashboardData.analytics.totalViews,
                                            subtitle: "Event page views",
                                            icon: Eye
                                        },
                                        {
                                            title: "Conversion Rate",
                                            value: `${dashboardData.analytics.conversionRate}%`,
                                            subtitle: "Views to RSVPs",
                                            icon: TrendingUp
                                        }
                                    ].map((card, index) => (
                                        <AnimatedDashboardCard key={card.title} index={index}>
                                            <Card>
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                                    <card.icon className="h-4 w-4 text-muted-foreground" />
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">{card.value}</div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {card.subtitle}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </AnimatedDashboardCard>
                                    ))}
                                </div>

                                {/* Event Sections */}
                                <EventSection
                                    title="Ongoing Events"
                                    events={dashboardData.categorizedEvents.ongoing}
                                    emptyMessage="No ongoing events at the moment."
                                    index={0}
                                />

                                <EventSection
                                    title="Upcoming Events"
                                    events={dashboardData.categorizedEvents.upcoming}
                                    emptyMessage="No upcoming events scheduled."
                                    index={1}
                                />

                                <EventSection
                                    title="Past Events"
                                    events={dashboardData.categorizedEvents.past.slice(0, 6)}
                                    emptyMessage="No past events found."
                                    index={2}
                                />
                            </TabsContent>

                            <TabsContent value="analytics">
                                <AnimatedDashboardSection index={0}>
                                    <DashboardAnalytics analyticsData={dashboardData.analytics} />
                                </AnimatedDashboardSection>
                            </TabsContent>
                        </Tabs>
                    </AnimatedDashboardTabs>
                </AnimatedPage>
            )}
        </div>
    );
}