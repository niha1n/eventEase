import { notFound, redirect } from "next/navigation";
import EventForm from "@/components/events/event-form";
import { requireEventOwnership } from "@/lib/auth-server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { eventSchema, customFieldSchema } from "@/lib/validators";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

type EventFormData = z.infer<typeof eventSchema>;
type CustomField = z.infer<typeof customFieldSchema>;

export async function generateMetadata({ params }: PageProps) {
    const { id } = await params;
    const event = await prisma.event.findUnique({
        where: { id },
    });

    if (!event) {
        return {
            title: "Event Not Found | EventEase",
        };
    }

    return {
        title: `Edit ${event.title} | EventEase`,
        description: `Edit your event: ${event.title}`,
    };
}

export default async function EditEventPage({ params }: PageProps) {
    const { id } = await params;
    try {
        await requireEventOwnership(id);
    } catch (error) {
        redirect("/sign-in");
    }

    const event = await prisma.event.findUnique({
        where: { id },
    });

    if (!event) {
        notFound();
    }

    // Parse and validate custom fields
    const customFields = event.customFields
        ? (event.customFields as CustomField[]).filter(field =>
            customFieldSchema.safeParse(field).success
        )
        : [];

    // Format the event data for the form
    const formattedEvent: EventFormData & { id: string } = {
        id: event.id,
        title: event.title,
        description: event.description || "",
        location: event.location || "",
        startDate: event.startDate,
        endDate: event.endDate || undefined,
        isPublished: event.isPublished,
        customFields,
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Edit Event</h1>
                <p className="text-muted-foreground mt-2">
                    Update your event details below.
                </p>
            </div>

            <EventForm initialData={formattedEvent} />
        </div>
    );
} 