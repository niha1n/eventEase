import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { isPublished } = body;

    // Verify event ownership
    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
      select: { userId: true },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    if (event.userId !== user.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update event
    const updatedEvent = await prisma.event.update({
      where: { id: params.eventId },
      data: { isPublished },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Event Update Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify event ownership
    const event = await prisma.event.findUnique({
      where: { id: params.eventId },
      select: { userId: true },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    if (event.userId !== user.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete event
    await prisma.event.delete({
      where: { id: params.eventId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Event Delete Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
