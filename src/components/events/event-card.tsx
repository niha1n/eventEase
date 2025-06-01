"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    Clock,
    Edit,
    EyeIcon,
    MapPin,
    MoreHorizontal,
    Share2,
    Trash2,
    Users
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { deleteEvent, toggleEventPublishStatus } from "@/lib/event-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type EventCardProps = {
    event: {
        id: string;
        title: string;
        description?: string | null;
        location?: string | null;
        startDate: Date;
        endDate?: Date | null;
        isPublished: boolean;
        customFields?: any;
        _count?: {
            rsvps: number;
        };
    };
};

export default function EventCard({ event }: EventCardProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [isCopying, setIsCopying] = useState(false);

    // Convert dates once at the start
    const startDate = event.startDate instanceof Date ? event.startDate : new Date(event.startDate);
    const endDate = event.endDate ? (event.endDate instanceof Date ? event.endDate : new Date(event.endDate)) : null;

    const handleCopyLink = async () => {
        try {
            setIsCopying(true);
            // Get the base URL from environment variables
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
            const url = `${baseUrl}/event/${event.id}`;

            // Try to use the modern clipboard API first
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(url);
            } else {
                // Fallback for older browsers or non-secure contexts
                const textArea = document.createElement('textarea');
                textArea.value = url;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                textArea.remove();
            }

            toast.success("Event link copied to clipboard");
        } catch (error) {
            console.error('Failed to copy link:', error);
            toast.error("Failed to copy event link");
        } finally {
            setIsCopying(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteEvent(event.id);
            if (result.success) {
                toast.success("Event deleted successfully");
                router.refresh();
            } else {
                toast.error(result.error as string || "Failed to delete event");
            }
        } catch (error) {
            toast.error("An error occurred while deleting the event");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleTogglePublish = async () => {
        setIsToggling(true);
        try {
            const result = await toggleEventPublishStatus(event.id);
            if (result.success && result.data) {
                toast.success(
                    result.data.isPublished
                        ? "Event published successfully"
                        : "Event unpublished successfully"
                );
                router.refresh();
            } else {
                toast.error(result.error as string || "Failed to update event status");
            }
        } catch (error) {
            toast.error("An error occurred while updating event status");
        } finally {
            setIsToggling(false);
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="line-clamp-1 mr-4">{event.title}</CardTitle>
                    <TooltipProvider>
                        <DropdownMenu>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Options</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Actions</TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/events/${event.id}`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Event
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/events/${event.id}/attendees`}>
                                        <Users className="mr-2 h-4 w-4" />
                                        Manage Attendees
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/event/${event.id}`} target="_blank">
                                        <EyeIcon className="mr-2 h-4 w-4" />
                                        View Public Page
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleCopyLink}
                                    disabled={isCopying}
                                >
                                    <Share2 className={cn("mr-2 h-4 w-4", isCopying && "animate-spin")} />
                                    {isCopying ? "Copying..." : "Copy Event Link"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleTogglePublish} disabled={isToggling}>
                                    {event.isPublished ? (
                                        <>
                                            <EyeIcon className="mr-2 h-4 w-4 text-destructive" />
                                            <span className="text-destructive">Unpublish Event</span>
                                        </>
                                    ) : (
                                        <>
                                            <EyeIcon className="mr-2 h-4 w-4 text-primary" />
                                            <span className="text-primary">Publish Event</span>
                                        </>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                            onSelect={(e) => e.preventDefault()}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Event
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Event</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to delete this event? This action cannot be
                                                undone and will remove all attendee data.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                className="bg-destructive hover:bg-destructive/90"
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? "Deleting..." : "Delete"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TooltipProvider>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <Badge variant={event.isPublished ? "default" : "outline"}>
                        {event.isPublished ? "Published" : "Draft"}
                    </Badge>
                    {event._count && (
                        <Badge variant="secondary">
                            <Users className="h-3 w-3 mr-1" />
                            {event._count.rsvps} {event._count.rsvps === 1 ? "Attendee" : "Attendees"}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="py-2 flex-grow">
                <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                    {event.description || "No description provided"}
                </CardDescription>
                <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                            {format(startDate, "MMMM d, yyyy")}
                            {endDate && ` - ${format(endDate, "MMMM d, yyyy")}`}
                        </span>
                    </div>
                    <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>
                            {format(startDate, "h:mm a")}
                            {endDate && ` - ${format(endDate, "h:mm a")}`}
                        </span>
                    </div>
                    {event.location && (
                        <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="line-clamp-1">{event.location}</span>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="pt-2">
                <div className="flex items-center justify-between w-full">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/events/${event.id}/attendees`}>
                            <Users className="h-4 w-4 mr-2" />
                            Attendees
                        </Link>
                    </Button>
                    <Button size="sm" asChild>
                        <Link href={`/dashboard/events/${event.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Link>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}