import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

const updateRoleSchema = z.object({
  userId: z.string(),
  role: z.nativeEnum(Role),
});

export async function POST(req: NextRequest) {
  try {
    // Get the current user's session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Check if user is authenticated
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the current user's role
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    // Only allow admins to update roles
    if (!currentUser || currentUser.role !== Role.ADMIN) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Parse and validate the request body
    const body = await req.json();
    const { userId, role } = updateRoleSchema.parse(body);

    // Update the user's role in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    // Create an audit log entry
    await prisma.auditLog.create({
      data: {
        action: "UPDATE_ROLE",
        userId: session.user.id, // The admin who made the change
        targetUserId: userId, // The user whose role was changed
        details: {
          newRole: role,
          previousRole: updatedUser.role,
        },
      },
    });

    return NextResponse.json({
      message: "Role updated successfully",
      user: {
        id: updatedUser.id,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Error updating role:", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid role data", { status: 400 });
    }
    return new NextResponse("Internal server error", { status: 500 });
  }
}
