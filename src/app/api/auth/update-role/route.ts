import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { role } = updateRoleSchema.parse(body);

    // Update the user's role in the database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role },
    });

    return new NextResponse("Role updated successfully", { status: 200 });
  } catch (error) {
    console.error("Error updating role:", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid role data", { status: 400 });
    }
    return new NextResponse("Internal server error", { status: 500 });
  }
}
