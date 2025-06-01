import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: { eventId: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { eventId } = context.params;
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        user: {
          select: { name: true, email: true },
        },
        _count: {
          select: { rsvps: true, views: true },
        },
      },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }

    const userWithRole = await prisma.user.findUnique({
      where: { id: user.user.id },
      select: { role: true },
    });

    if (
      userWithRole?.role === "ADMIN" ||
      userWithRole?.role === "STAFF" ||
      event.userId === user.user.id
    ) {
      return NextResponse.json(event);
    }

    if (!event.isPublished) {
      return new NextResponse("Event not found", { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Event Get Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { eventId: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { eventId } = context.params;
    const body = await request.json();
    const { isPublished } = body;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { userId: true },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }
    if (event.userId !== user.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: { isPublished },
    });
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Event Update Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { eventId: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { eventId } = context.params;
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { userId: true },
    });

    if (!event) {
      return new NextResponse("Event not found", { status: 404 });
    }
    if (event.userId !== user.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.event.delete({ where: { id: eventId } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Event Delete Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
