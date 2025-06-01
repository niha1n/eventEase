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
            <Icon className="w-3 h-3 mr-1" />
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

function EventSection({ title, events, emptyMessage }: { title: string; events: Event[]; emptyMessage: string }) {
    return (
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
                    {events.map((event) => (
                        <Card key={event.id} className="relative overflow-hidden">
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
                    ))}
                </div>
            )}
        </div>
    );
}

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [activeTab, setActiveTab] = useState("overview");

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
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Failed to load dashboard data</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8">
                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{dashboardData.totalEvents}</div>
                                <p className="text-xs text-muted-foreground">
                                    {dashboardData.publishedEvents} published
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total RSVPs</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{dashboardData.totalRSVPs}</div>
                                <p className="text-xs text-muted-foreground">
                                    Across all events
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                                <Eye className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{dashboardData.analytics.totalViews}</div>
                                <p className="text-xs text-muted-foreground">
                                    Event page views
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{dashboardData.analytics.conversionRate}%</div>
                                <p className="text-xs text-muted-foreground">
                                    Views to RSVPs
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Ongoing Events */}
                    <EventSection
                        title="Ongoing Events"
                        events={dashboardData.categorizedEvents.ongoing}
                        emptyMessage="No ongoing events at the moment."
                    />

                    {/* Upcoming Events */}
                    <EventSection
                        title="Upcoming Events"
                        events={dashboardData.categorizedEvents.upcoming}
                        emptyMessage="No upcoming events scheduled."
                    />

                    {/* Past Events */}
                    <EventSection
                        title="Past Events"
                        events={dashboardData.categorizedEvents.past.slice(0, 6)}
                        emptyMessage="No past events found."
                    />
                </TabsContent>

                <TabsContent value="analytics">
                    <DashboardAnalytics analyticsData={dashboardData.analytics} />
                </TabsContent>
            </Tabs>
        </div>
    );
}