import { notFound, redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftIcon, UsersIcon, MailIcon, CalendarIcon, PhoneIcon } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

interface AttendeesPageProps {
    params: {
        id: string;
    };
}

export async function generateMetadata({ params }: AttendeesPageProps) {
    const { id } = params;

    const event = await prisma.event.findUnique({
        where: { id },
        select: { title: true }
    });

    if (!event) {
        return {
            title: "Event Not Found | EventEase",
        };
    }

    return {
        title: `Attendees - ${event.title} | EventEase`,
        description: `Manage attendees for ${event.title}`,
    };
}

export default async function AttendeesPage({ params }: AttendeesPageProps) {
    const { id } = params;

    const user = await getAuthenticatedUser();
    if (!user) {
        redirect("/login");
    }

    const event = await prisma.event.findUnique({
        where: { id },
        include: {
            rsvps: {
                orderBy: {
                    createdAt: 'desc'
                }
            },
            _count: {
                select: { rsvps: true }
            }
        }
    });

    if (!event) {
        notFound();
    }

    // Check if user owns the event
    if (event.userId !== user.user.id) {
        redirect("/dashboard");
    }

    return (
        <div className="container max-w-5xl py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/events/${id}/view`}>
                            <ArrowLeftIcon className="h-4 w-4" />
                            <span className="sr-only">Back to event</span>
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Attendees</h1>
                        <p className="text-muted-foreground">
                            Manage attendees for {event.title}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm px-3 py-1">
                        <UsersIcon className="mr-1 h-3 w-3" />
                        {event._count.rsvps} {event._count.rsvps === 1 ? "Attendee" : "Attendees"}
                    </Badge>
                </div>
            </div>

            <Separator />

            {/* Attendees List */}
            <Card>
                <CardHeader>
                    <CardTitle>Attendee List</CardTitle>
                    <CardDescription>
                        View and manage your event attendees
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {event.rsvps.length === 0 ? (
                        <div className="text-center py-12">
                            <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                            <h3 className="mt-4 text-lg font-semibold">No Attendees Yet</h3>
                            <p className="text-muted-foreground mt-2">
                                Share your event to start getting RSVPs
                            </p>
                            <Button variant="outline" className="mt-4" asChild>
                                <Link href={`/event/${id}`} target="_blank">
                                    View Public Event Page
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {event.rsvps.map((rsvp) => (
                                <div
                                    key={rsvp.id}
                                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {rsvp.name}
                                            </span>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MailIcon className="h-3 w-3" />
                                                <span>{rsvp.email}</span>
                                                {rsvp.phone && (
                                                    <>
                                                        <span className="mx-1">•</span>
                                                        <PhoneIcon className="h-3 w-3" />
                                                        <span>{rsvp.phone}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        <CalendarIcon className="h-3 w-3 inline mr-1" />
                                        RSVP'd {format(new Date(rsvp.createdAt), "MMM d, yyyy")}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 