import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "./auth";
import prisma from "./prisma";

// Server-side auth utilities
export async function getAuthenticatedUser() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return null;
    }
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function requireAuth() {
  const session = await getAuthenticatedUser();
  if (!session) {
    redirect("/sign-in");
  }
  return session;
}

export async function requireRole(role: string) {
  const session = await requireAuth();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || user.role !== role) {
    redirect("/unauthorized");
  }

  return session;
}

export async function requireEventOwnership(eventId: string) {
  const session = await requireAuth();
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { userId: true },
  });

  if (!event || event.userId !== session.user.id) {
    redirect("/unauthorized");
  }

  return session;
}
