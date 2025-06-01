import { notFound, redirect } from "next/navigation";
import { requireEventOwnership, getAuthenticatedUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon, PencilIcon, Share2Icon, EyeIcon, LinkIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface ViewEventPageProps {
    params: {
        id: string;
    };
}

export async function generateMetadata({ params }: ViewEventPageProps) {
    const event = await prisma.event.findUnique({
        where: { id: params.id },
        include: {
            _count: {
                select: {
                    rsvps: true,
                },
            },
        },
    });

    if (!event) {
        return {
            title: "Event Not Found | EventEase",
        };
    }

    return {
        title: `${event.title} | EventEase`,
        description: event.description || `View details for ${event.title}`,
    };
}

export default async function ViewEventPage({ params }: ViewEventPageProps) {
    const user = await getAuthenticatedUser();
    if (!user) {
        redirect("/login");
    }

    const event = await prisma.event.findUnique({
        where: { id: params.id },
        include: {
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

    // Convert dates once at the start
    const startDate = event.startDate instanceof Date ? event.startDate : new Date(event.startDate);
    const endDate = event.endDate ? (event.endDate instanceof Date ? event.endDate : new Date(event.endDate)) : null;

    return (
        <div className="container max-w-5xl py-8 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
                        <p className="text-muted-foreground text-lg">
                            {event.description}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/event/${params.id}`} target="_blank">
                                <EyeIcon className="mr-2 h-4 w-4" />
                                View Public Page
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/events/${params.id}/edit`}>
                                <PencilIcon className="mr-2 h-4 w-4" />
                                Edit Event
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge
                        variant={event.isPublished ? "default" : "secondary"}
                        className={cn(
                            "text-sm px-3 py-1",
                            event.isPublished && "bg-green-100 text-green-700 hover:bg-green-100"
                        )}
                    >
                        {event.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <Badge variant="outline" className="text-sm px-3 py-1">
                        <UsersIcon className="mr-1 h-3 w-3" />
                        {event._count.rsvps} {event._count.rsvps === 1 ? "RSVP" : "RSVPs"}
                    </Badge>
                </div>
            </div>

            <Separator />

            {/* Main Content Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Event Details Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-xl">Event Details</CardTitle>
                        <CardDescription>Basic information about your event</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Date & Time</div>
                                <div className="space-y-1">
                                    <div className="flex items-center text-sm">
                                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {format(startDate, "EEEE, MMMM d, yyyy")}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <ClockIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {format(startDate, "h:mm a")}
                                            {endDate && ` - ${format(endDate, "h:mm a")}`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Location</div>
                                <div className="flex items-center text-sm">
                                    <MapPinIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>{event.location || "No location specified"}</span>
                                </div>
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">Event Link</div>
                            <div className="flex items-center gap-2">
                                <code className="relative rounded bg-muted px-2 py-1 text-sm font-mono">
                                    {`${process.env.NEXT_PUBLIC_APP_URL}/event/${event.id}`}
                                </code>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <LinkIcon className="h-4 w-4" />
                                    <span className="sr-only">Copy link</span>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* RSVPs Card */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-xl">RSVPs</CardTitle>
                        <CardDescription>Track your event attendance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold">{event._count.rsvps}</div>
                                <Badge variant="secondary">Total RSVPs</Badge>
                            </div>
                            <Separator />
                            <div className="text-center py-6">
                                <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <p className="mt-2 text-sm text-muted-foreground">
                                    RSVP management coming soon...
                                </p>
                                <Button variant="outline" size="sm" className="mt-4" asChild>
                                    <Link href={`/dashboard/events/${params.id}/attendees`}>
                                        View Attendees
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t bg-muted/50">
                        <Button variant="ghost" size="sm" className="w-full" asChild>
                            <Link href={`/dashboard/events/${params.id}/attendees`}>
                                Manage Attendees
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/events/${params.id}/edit`}>
                        <PencilIcon className="mr-2 h-4 w-4" />
                        Edit Event
                    </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/event/${params.id}`} target="_blank">
                        <Share2Icon className="mr-2 h-4 w-4" />
                        Share Event
                    </Link>
                </Button>
            </div>
        </div>
    );
} 