import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    // Set session expiry
    maxAge: 30 * 24 * 60 * 60, // 30 days
    // Set session refresh age
    freshAge: 24 * 60 * 60, // 24 hours
  },
});
