"use server";

import { auth } from "./auth";
import prisma from "./prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eventSchema } from "./validators";
import { requireAuth, requireEventOwnership } from "./auth-server";
import { redirect } from "next/navigation";

// Create a new event
export async function createEvent(formData: z.infer<typeof eventSchema>) {
  const user = await requireAuth();

  try {
    // Validate the form data
    const validatedData = eventSchema.parse(formData);

    // Create the event in the database
    const event = await prisma.event.create({
      data: {
        ...validatedData,
        userId: user.user.id,
        customFields: validatedData.customFields ?? [],
      },
    });

    revalidatePath("/dashboard/events");
    return { success: true, data: event };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    return { success: false, error: "Failed to create event" };
  }
}

// Get all events for the current user
export async function getUserEvents() {
  const user = await requireAuth();

  try {
    const events = await prisma.event.findMany({
      where: {
        userId: user.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: events };
  } catch (error) {
    return { success: false, error: "Failed to fetch events" };
  }
}

// Get all events (admin/staff only)
export async function getAllEvents() {
  const user = await requireAuth();

  // Check if user is admin or staff
  const userWithRole = await prisma.user.findUnique({
    where: { id: user.user.id },
    select: { role: true },
  });

  if (userWithRole?.role !== "ADMIN" && userWithRole?.role !== "STAFF") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const events = await prisma.event.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return { success: true, data: events };
  } catch (error) {
    return { success: false, error: "Failed to fetch events" };
  }
}

// Get a single event by ID
export async function getEvent(id: string) {
  try {
    const event = await prisma.event.findUnique({
      where: {
        id,
      },
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    return { success: true, data: event };
  } catch (error) {
    return { success: false, error: "Failed to fetch event" };
  }
}

// Update an event
export async function updateEvent(
  id: string,
  formData: z.infer<typeof eventSchema>
) {
  await requireEventOwnership(id);

  try {
    // Validate the form data
    const validatedData = eventSchema.parse(formData);

    // Update the event in the database
    const event = await prisma.event.update({
      where: {
        id,
      },
      data: {
        ...validatedData,
        customFields: validatedData.customFields ?? [],
      },
    });

    revalidatePath(`/dashboard/events/${id}`);
    revalidatePath(`/dashboard/events`);
    return { success: true, data: event };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors };
    }
    return { success: false, error: "Failed to update event" };
  }
}

// Delete an event
export async function deleteEvent(id: string) {
  await requireEventOwnership(id);

  try {
    await prisma.event.delete({
      where: {
        id,
      },
    });

    revalidatePath("/dashboard/events");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete event" };
  }
}

// Publish/unpublish an event
export async function toggleEventPublishStatus(id: string) {
  await requireEventOwnership(id);

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      select: { isPublished: true },
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: { isPublished: !event.isPublished },
    });

    revalidatePath(`/dashboard/events/${id}`);
    revalidatePath(`/dashboard/events`);
    return { success: true, data: updatedEvent };
  } catch (error) {
    return { success: false, error: "Failed to update event status" };
  }
}
