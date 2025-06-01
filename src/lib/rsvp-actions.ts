"use server";

import prisma from "./prisma";
import { z } from "zod";
import { rsvpSchema, createDynamicRSVPValidator } from "./validators";
import { revalidatePath } from "next/cache";
import { requireEventOwnership } from "./auth-server";

// Submit RSVP for an event
export async function submitRSVP(formData: z.infer<typeof rsvpSchema>) {
  try {
    // Get the event to check custom fields
    const event = await prisma.event.findUnique({
      where: { id: formData.eventId },
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    if (!event.isPublished) {
      return { success: false, error: "Event is not published" };
    }

    // Validate the form data
    const customFields = (event.customFields as any[]) || [];
    const validator =
      customFields.length > 0
        ? createDynamicRSVPValidator(customFields)
        : rsvpSchema;

    const validatedData = validator.parse(formData);

    // Create the RSVP in the database
    const rsvp = await prisma.rSVP.create({
      data: validatedData,
    });

    revalidatePath(`/event/${event.id}`);
    return { success: true, data: rsvp };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    return { success: false, error: "Failed to submit RSVP" };
  }
}

// Get RSVPs for an event
export async function getEventRSVPs(eventId: string) {
  await requireEventOwnership(eventId);

  try {
    const rsvps = await prisma.rSVP.findMany({
      where: {
        eventId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: rsvps };
  } catch (error) {
    return { success: false, error: "Failed to fetch RSVPs" };
  }
}

// Export RSVPs as CSV
export async function exportRSVPsAsCSV(eventId: string) {
  await requireEventOwnership(eventId);

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { title: true, customFields: true },
    });

    const rsvps = await prisma.rSVP.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    // Format the data for CSV
    const customFields = (event.customFields as any[]) || [];
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Registration Date",
      ...customFields.map((field) => field.label),
    ];

    const rows = rsvps.map((rsvp) => {
      const responses = (rsvp.responses as Record<string, any>) || {};

      return [
        rsvp.name,
        rsvp.email,
        rsvp.phone || "",
        new Date(rsvp.createdAt).toLocaleString(),
        ...customFields.map((field) => {
          const value = responses[field.id];
          if (value === undefined) return "";
          if (typeof value === "boolean") return value ? "Yes" : "No";
          if (value instanceof Date) return value.toLocaleDateString();
          return String(value);
        }),
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    return {
      success: true,
      data: {
        content: csvContent,
        filename: `${event.title
          .replace(/[^a-z0-9]/gi, "-")
          .toLowerCase()}-rsvps.csv`,
      },
    };
  } catch (error) {
    return { success: false, error: "Failed to export RSVPs" };
  }
}
