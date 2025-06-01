"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlusIcon, CalendarIcon, UsersIcon, ClockIcon, MoreVerticalIcon, PencilIcon, TrashIcon, EyeIcon, MapPinIcon, SearchIcon, FilterIcon } from "lucide-react";
import Link from "next/link";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface Event {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    isPublished: boolean;
    _count: {
        rsvps: number;
    };
}

export default function EventsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [events, setEvents] = useState<Event[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    // New state for filters and sorting
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
    const [sortBy, setSortBy] = useState<"date" | "title" | "rsvps">("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/events");
            if (!response.ok) {
                throw new Error("Failed to fetch events");
            }
            const data = await response.json();
            setEvents(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load events");
            toast.error("Failed to load events");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (eventId: string) => {
        if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
            return;
        }

        try {
            setIsDeleting(eventId);
            const response = await fetch(`/api/events/${eventId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete event");
            }

            setEvents(events.filter(event => event.id !== eventId));
            toast.success("Event deleted successfully");
        } catch (err) {
            toast.error("Failed to delete event");
            console.error(err);
        } finally {
            setIsDeleting(null);
        }
    };

    const handlePublish = async (eventId: string, currentStatus: boolean) => {
        try {
            setIsUpdating(eventId);
            const response = await fetch(`/api/events/${eventId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    isPublished: !currentStatus,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update event status");
            }

            setEvents(events.map(event =>
                event.id === eventId
                    ? { ...event, isPublished: !currentStatus }
                    : event
            ));
            toast.success(`Event ${!currentStatus ? 'published' : 'unpublished'} successfully`);
        } catch (err) {
            toast.error("Failed to update event status");
            console.error(err);
        } finally {
            setIsUpdating(null);
        }
    };

    const handleViewEvent = (eventId: string) => {
        router.push(`/dashboard/events/${eventId}/view`);
    };

    const handleEditEvent = (eventId: string) => {
        router.push(`/dashboard/events/${eventId}/edit`);
    };

    const now = new Date();
    const ongoingEvents = events.filter(event => {
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);
        return startDate <= now && endDate >= now;
    });

    const pastEvents = events.filter(event => {
        const endDate = new Date(event.endDate);
        return endDate < now;
    });

    const upcomingEvents = events.filter(event => {
        const startDate = new Date(event.startDate);
        return startDate > now;
    });

    const filteredAndSortedEvents = events
        .filter(event => {
            const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.location.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === "all" ||
                (statusFilter === "published" && event.isPublished) ||
                (statusFilter === "draft" && !event.isPublished);

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "date":
                    return sortOrder === "asc"
                        ? new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
                        : new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
                case "title":
                    return sortOrder === "asc"
                        ? a.title.localeCompare(b.title)
                        : b.title.localeCompare(a.title);
                case "rsvps":
                    return sortOrder === "asc"
                        ? a._count.rsvps - b._count.rsvps
                        : b._count.rsvps - a._count.rsvps;
                default:
                    return 0;
            }
        });

    if (isLoading) {
        return <LoadingScreen message="Loading your events..." />;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
                <h2 className="text-2xl font-semibold text-red-600 mb-4">Error Loading Events</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button
                    onClick={fetchEvents}
                    variant="outline"
                >
                    Try Again
                </Button>
            </div>
        );
    }

    const renderEventCard = (event: Event) => (
        <Card
            key={event.id}
            className="group relative flex flex-col h-full transition-all hover:shadow-md"
        >
            <CardHeader className="flex-none">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="line-clamp-1 text-lg">
                            {event.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-1.5">
                            {event.description}
                        </CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <MoreVerticalIcon className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                                onClick={() => handleViewEvent(event.id)}
                                className="cursor-pointer"
                            >
                                <EyeIcon className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleEditEvent(event.id)}
                                className="cursor-pointer"
                            >
                                <PencilIcon className="mr-2 h-4 w-4" />
                                Edit Event
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => handlePublish(event.id, event.isPublished)}
                                className={cn(
                                    "cursor-pointer",
                                    isUpdating === event.id && "opacity-50 cursor-not-allowed"
                                )}
                                disabled={isUpdating === event.id}
                            >
                                {isUpdating === event.id
                                    ? "Updating..."
                                    : event.isPublished
                                        ? "Unpublish Event"
                                        : "Publish Event"
                                }
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => handleDelete(event.id)}
                                className={cn(
                                    "text-red-600 cursor-pointer",
                                    isDeleting === event.id && "opacity-50 cursor-not-allowed"
                                )}
                                disabled={isDeleting === event.id}
                            >
                                <TrashIcon className="mr-2 h-4 w-4" />
                                {isDeleting === event.id ? "Deleting..." : "Delete Event"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <Badge
                    variant={event.isPublished ? "default" : "secondary"}
                    className={cn(
                        "mt-2",
                        event.isPublished && "bg-green-100 text-green-700 hover:bg-green-100"
                    )}
                >
                    {event.isPublished ? "Published" : "Draft"}
                </Badge>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="space-y-3 text-sm">
                    <div className="flex items-center text-muted-foreground">
                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">
                            {format(new Date(event.startDate), "EEEE, MMMM d, yyyy")}
                        </span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                        <ClockIcon className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">
                            {format(new Date(event.startDate), "h:mm a")} -{" "}
                            {format(new Date(event.endDate), "h:mm a")}
                        </span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                        <MapPinIcon className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">{event.location}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex-none pt-4 border-t">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <UsersIcon className="mr-2 h-4 w-4" />
                        <span>{event._count.rsvps} RSVPs</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewEvent(event.id)}
                        className="text-primary hover:text-primary/90"
                    >
                        View Details
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Events</h1>
                    <p className="text-muted-foreground">
                        Manage and track all your events
                    </p>
                </div>
                <Link href="/dashboard/events/create">
                    <Button>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Create Event
                    </Button>
                </Link>
            </div>

            {events.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Events Yet</h3>
                        <p className="text-muted-foreground text-center mb-6">
                            Get started by creating your first event
                        </p>
                        <Link href="/dashboard/events/create">
                            <Button>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Create Your First Event
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 items-center gap-2">
                            <div className="relative flex-1 max-w-sm">
                                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search events..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select
                                value={statusFilter}
                                onValueChange={(value: "all" | "published" | "draft") => setStatusFilter(value)}
                            >
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Events</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select
                                value={sortBy}
                                onValueChange={(value: "date" | "title" | "rsvps") => setSortBy(value)}
                            >
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date">Date</SelectItem>
                                    <SelectItem value="title">Title</SelectItem>
                                    <SelectItem value="rsvps">RSVPs</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                            >
                                {sortOrder === "asc" ? "↑" : "↓"}
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredAndSortedEvents.map(renderEventCard)}
                    </div>

                    {filteredAndSortedEvents.length === 0 && (
                        <div className="text-center py-12">
                            <FilterIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
                            <p className="text-muted-foreground">
                                Try adjusting your search or filters
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}