import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

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

    // Get the current user's role
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    // Only allow admins to view audit logs
    if (!currentUser || currentUser.role !== Role.ADMIN) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Fetch audit logs with user details
    const auditLogs = await prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        targetUser: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100, // Limit to last 100 entries
    });

    return NextResponse.json({ auditLogs });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
