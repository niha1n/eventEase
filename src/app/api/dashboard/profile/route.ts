import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
});

// GET /api/dashboard/profile
export async function GET() {
  try {
    // Get the current user's session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Check if user is authenticated
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch user profile with event count
    const profile = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            events: true,
          },
        },
      },
    });

    if (!profile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("[GET /api/dashboard/profile] Error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

// PUT /api/dashboard/profile
export async function PUT(req: Request) {
  try {
    // Get the current user's session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Check if user is authenticated
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Parse and validate the request body
    const body = await req.json();
    const { name } = updateProfileSchema.parse(body);

    // Update the user's profile
    const updatedProfile = await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            events: true,
          },
        },
      },
    });

    // Create an audit log entry
    await prisma.auditLog.create({
      data: {
        action: "UPDATE_PROFILE",
        userId: session.user.id,
        details: {
          field: "name",
          oldValue: session.user.name,
          newValue: name,
        },
      },
    });

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error("[PUT /api/dashboard/profile] Error:", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid profile data", { status: 400 });
    }
    return new NextResponse("Internal server error", { status: 500 });
  }
}
