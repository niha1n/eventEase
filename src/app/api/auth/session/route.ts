import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return new NextResponse(null, { status: 401 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("[GET /api/auth/session] Error:", error);
    return new NextResponse(null, { status: 500 });
  }
}
