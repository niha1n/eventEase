import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const auth = betterAuth({
  baseURL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    endpoints: {
      signUp: "/api/auth/[...all]",
      signIn: "/api/auth/sign-in",
      signOut: "/api/auth/sign-out",
      session: "/api/auth/session",
    },
  },
  session: {
    // Set session expiry
    maxAge: 30 * 24 * 60 * 60, // 30 days
    // Set session refresh age
    freshAge: 24 * 60 * 60, // 24 hours
  },
});
