import { redirect } from "next/navigation";
import EventForm from "@/components/events/event-form";
import { getAuthenticatedUser } from "@/lib/auth-server";

// Mark this route as dynamic to prevent static optimization
export const dynamic = 'force-dynamic';

export const metadata = {
    title: "Create Event | EventEase",
    description: "Create a new event",
};

export default async function CreateEventPage() {
    const user = await getAuthenticatedUser();

    if (!user) {
        redirect("/sign-in");
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Create Event</h1>
                <p className="text-muted-foreground mt-2">
                    Fill in the details below to create your event.
                </p>
            </div>

            <EventForm />
        </div>
    );
}