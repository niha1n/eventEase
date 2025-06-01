import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user with role
    const userWithRole = await prisma.user.findUnique({
      where: { id: user.user.id },
      select: { role: true },
    });

    // If admin or staff, get all events
    if (userWithRole?.role === "ADMIN" || userWithRole?.role === "STAFF") {
      const allEvents = await prisma.event.findMany({
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
          _count: {
            select: {
              rsvps: true,
            },
          },
        },
      });

      return NextResponse.json(allEvents);
    }

    // For regular users, get only their events
    const userEvents = await prisma.event.findMany({
      where: {
        userId: user.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            rsvps: true,
          },
        },
      },
    });

    return NextResponse.json(userEvents);
  } catch (error) {
    console.error("Events API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
