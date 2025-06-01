import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, Clock, MapPin, Users, Lock, EyeOff, BarChart } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import RSVPForm from "@/components/rsvp/rsvp-form";
import EventAnalytics from "@/components/analytics/event-analytics";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { customFieldSchema } from "@/lib/validators";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Event, EventView, RSVP } from "@prisma/client";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

type EventWithRelations = Event & {
    _count: {
        rsvps: number;
        views: number;
    };
    rsvps: Array<{
        createdAt: Date;
        status: RSVP['status'];
    }>;
    views: Array<{
        createdAt: Date;
        source: EventView['source'];
    }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const event = await prisma.event.findUnique({
        where: { id: id },
        select: { title: true, description: true, isPublished: true },
    });

    if (!event) {
        return {
            title: "Event Not Found",
        };
    }

    if (!event.isPublished) {
        return {
            title: "Event Not Published",
            description: "This event is not yet published",
        };
    }

    return {
        title: event.title,
        description: event.description || undefined,
    };
}

export default async function EventPage({ params }: PageProps) {
    const { id } = await params;
    const event = await prisma.event.findUnique({
        where: { id: id },
        include: {
            _count: {
                select: {
                    rsvps: true,
                    views: true,
                },
            },
            rsvps: {
                select: {
                    createdAt: true,
                    status: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            },
            views: {
                select: {
                    createdAt: true,
                    source: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            },
        },
    }) as EventWithRelations | null;

    if (!event) {
        notFound();
    }

    // Record view
    await prisma.eventView.create({
        data: {
            eventId: event.id,
            source: 'direct',
        },
    });

    if (!event.isPublished) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
                <Card className="max-w-2xl w-full border-none shadow-lg">
                    <CardContent className="pt-12 pb-8 px-8 text-center">
                        <div className="mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                                <EyeOff className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">Event Not Published</h1>
                            <p className="text-muted-foreground text-lg">
                                This event is not yet available to the public.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground">
                                <Lock className="h-4 w-4" />
                                <span>Event is in draft mode</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                The event organizer is still working on this event.
                                Please check back later or contact the organizer for more information.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Parse custom fields
    const customFields = z.array(customFieldSchema).safeParse(event.customFields);
    const parsedCustomFields = customFields.success ? customFields.data : [];

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="relative border-b">
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
                <div className="container max-w-5xl mx-auto px-4 py-16 md:py-24">
                    <div className="max-w-3xl">
                        {/* Event Date */}
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-sm text-muted-foreground mb-6">
                            <Calendar className="h-4 w-4 mr-2" />
                            {format(new Date(event.startDate), "EEEE, MMMM d, yyyy")}
                        </div>

                        {/* Event Title */}
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                            {event.title}
                        </h1>

                        {/* Event Description */}
                        {event.description && (
                            <p className="text-lg text-muted-foreground mb-8">
                                {event.description}
                            </p>
                        )}

                        {/* Event Stats */}
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    {format(new Date(event.startDate), "h:mm a")}
                                    {event.endDate && ` - ${format(new Date(event.endDate), "h:mm a")}`}
                                </span>
                            </div>
                            {event.location && (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{event.location}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    {event._count.rsvps} {event._count.rsvps === 1 ? "Attendee" : "Attendees"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container max-w-5xl mx-auto px-4 py-12">
                <Tabs defaultValue="details" className="space-y-8">
                    <TabsList>
                        <TabsTrigger value="details">Event Details</TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center gap-2">
                            <BarChart className="h-4 w-4" />
                            Analytics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column - Event Details */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* About Event */}
                                <section>
                                    <h2 className="text-2xl font-semibold mb-6">About This Event</h2>
                                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                                        {event.description ? (
                                            <div className="whitespace-pre-line">{event.description}</div>
                                        ) : (
                                            <p className="text-muted-foreground italic">
                                                No description provided
                                            </p>
                                        )}
                                    </div>
                                </section>

                                {/* Additional Information */}
                                {Array.isArray(event.customFields) && event.customFields.length > 0 && (
                                    <section>
                                        <h2 className="text-2xl font-semibold mb-6">Additional Information</h2>
                                        <div className="grid gap-4">
                                            {parsedCustomFields.map((field) => (
                                                <div
                                                    key={field.id}
                                                    className="p-4 rounded-lg border bg-card"
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <h3 className="font-medium mb-1">
                                                                {field.label}
                                                                {field.required && (
                                                                    <span className="text-destructive ml-1">*</span>
                                                                )}
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                {field.placeholder || `Please provide your ${field.label.toLowerCase()}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>

                            {/* Right Column - RSVP Form */}
                            <div className="lg:col-span-1">
                                <div className="lg:sticky lg:top-8">
                                    <div className="rounded-lg border bg-card">
                                        <div className="p-6 border-b">
                                            <h2 className="text-xl font-semibold mb-2">Register for Event</h2>
                                            <p className="text-sm text-muted-foreground">
                                                {event._count.rsvps} {event._count.rsvps === 1 ? "person has" : "people have"} registered
                                            </p>
                                        </div>
                                        <div className="p-6">
                                            <RSVPForm eventId={event.id} customFields={parsedCustomFields} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="analytics">
                        <EventAnalytics
                            eventId={event.id}
                            eventData={{
                                title: event.title,
                                startDate: event.startDate,
                                endDate: event.endDate,
                                _count: {
                                    rsvps: event._count.rsvps,
                                    views: event._count.views,
                                },
                                rsvps: event.rsvps,
                                views: event.views,
                            }}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}