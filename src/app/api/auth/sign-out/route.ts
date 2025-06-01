import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[POST /api/auth/sign-out] Error:", error);
    return new NextResponse(null, { status: 500 });
  }
}
