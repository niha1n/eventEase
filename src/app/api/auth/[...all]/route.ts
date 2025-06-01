//src\app\api\auth\[...all]\route.ts

import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";
// import arcjet, { protectSignup } from "@arcjet/next";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Temporarily disable Arcjet
// const aj = arcjet({
//   key: process.env.ARCJET_KEY!,
//   rules: [
//     protectSignup({
//       email: {
//         mode: "LIVE",
//         block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
//       },
//       bots: {
//         mode: "LIVE",
//         allow: [],
//       },
//       rateLimit: {
//         mode: "LIVE",
//         interval: "10m",
//         max: 5000,
//       },
//     }),
//   ],
// });

const betterAuthHandlers = toNextJsHandler(auth.handler);

// Schema for sign-up data
const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  name: z.string(),
  role: z.nativeEnum(Role).optional(),
});

const ajProtectedPOST = async (req: NextRequest) => {
  // Check if this is a sign-up request
  const isSignUp = req.nextUrl.pathname.endsWith("/sign-up");

  if (isSignUp) {
    try {
      // Clone the request for body parsing
      const clonedReq = req.clone();
      const body = await clonedReq.json();

      console.log("[Sign-up] Received request with body:", {
        email: body.email,
        name: body.name,
        role: body.role,
        password: "[REDACTED]",
      });

      // Validate the request data
      const validatedData = signUpSchema.parse(body);
      const { email, role } = validatedData;

      // Temporarily disable Arcjet protection
      // const decision = await aj.protect(req, { email });
      // if (decision.isDenied()) {
      //   console.log("[Sign-up] Arcjet denied request:", decision.reason);
      //   if (decision.reason.isEmail()) {
      //     let message = "";
      //     if (decision.reason.emailTypes.includes("INVALID")) {
      //       message = "email address format is invalid. Is there a typo?";
      //     } else if (decision.reason.emailTypes.includes("DISPOSABLE")) {
      //       message = "we do not allow disposable email addresses.";
      //     } else if (decision.reason.emailTypes.includes("NO_MX_RECORDS")) {
      //       message = "your email domain does not have an MX record. Is there a typo?";
      //     } else {
      //       message = "invalid email.";
      //     }

      //     return NextResponse.json(
      //       { message, reason: decision.reason },
      //       { status: 400 }
      //     );
      //   } else {
      //     return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      //   }
      // }

      // Process the sign-up with Better Auth
      const authResponse = await betterAuthHandlers.POST(req);

      if (!authResponse.ok) {
        console.log(
          "[Sign-up] Better Auth returned error:",
          authResponse.status
        );
        return authResponse;
      }

      // Get the user data from the response
      const authData = await authResponse.json();

      // If we have a user and a role, update the user's role in the database
      if (authData.user && authData.user.id && role) {
        console.log(
          `[Sign-up] Updating user ${authData.user.id} role to ${role}`
        );

        try {
          // Update the user role
          const updatedUser = await prisma.user.update({
            where: { id: authData.user.id },
            data: { role },
          });

          console.log("[Sign-up] User role updated:", updatedUser.role);

          // Create an audit log entry
          await prisma.auditLog.create({
            data: {
              action: "ASSIGN_ROLE",
              userId: authData.user.id,
              details: {
                role,
                email: authData.user.email,
                name: authData.user.name || body.name,
              },
            },
          });

          // Update the user data with the new role
          authData.user.role = updatedUser.role;
        } catch (error) {
          console.error("[Sign-up] Failed to update user role:", error);
        }
      }

      // Return the updated user data
      return NextResponse.json(authData, {
        status: 200,
        headers: authResponse.headers,
      });
    } catch (error) {
      console.error("[Sign-up] Error processing request:", error);

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { message: "Invalid input data", errors: error.errors },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { message: "An error occurred during sign-up" },
        { status: 500 }
      );
    }
  }

  // For non-sign-up requests, just pass through to Better Auth
  return betterAuthHandlers.POST(req);
};

export { ajProtectedPOST as POST };
export const { GET } = betterAuthHandlers;
