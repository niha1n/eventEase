import { createAuthClient } from "better-auth/react";
import { Role } from "@prisma/client";

// Define the sign-up parameters type
type SignUpParams = {
  email: string;
  password: string;
  name: string;
  callbackURL?: string;
};

// Define the sign-up options type
type SignUpOptions = {
  onRequest?(): void;
  onSuccess?(): void;
  onError?(context: { error: Error }): void;
};

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  signUp: {
    email: async (params: SignUpParams, options?: SignUpOptions) => {
      try {
        console.log("[Client] Starting sign-up process:", {
          email: params.email,
          name: params.name,
          hasCallbackURL: !!params.callbackURL,
        });

        options?.onRequest?.();

        const { callbackURL, ...signUpData } = params;
        console.log("[Client] Sending sign-up request with data:", {
          ...signUpData,
          password: "[REDACTED]",
        });

        const response = await fetch("/api/auth/[...all]", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...signUpData,
            action: "sign-up",
          }),
        });

        console.log("[Client] Received response:", {
          status: response.status,
          ok: response.ok,
        });

        if (!response.ok) {
          const error = await response.json();
          console.error("[Client] Sign-up failed:", error);
          const errorMessage = error.message || "Failed to sign up";
          options?.onError?.({ error: new Error(errorMessage) });
          return { error: { message: errorMessage } };
        }

        const data = await response.json();
        console.log("[Client] Sign-up successful:", {
          hasUser: !!data.user,
          userId: data.user?.id,
          userRole: data.user?.role,
        });

        options?.onSuccess?.();
        return { data };
      } catch (error) {
        console.error("[Client] Unexpected error during sign-up:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to sign up";
        options?.onError?.({ error: new Error(errorMessage) });
        return { error: { message: errorMessage } };
      }
    },
  },
  signIn: {
    email: async (
      params: {
        email: string;
        password: string;
        callbackURL?: string;
      },
      options?: {
        onRequest?(): void;
        onSuccess?(): void;
        onError?(context: { error: Error }): void;
      }
    ) => {
      try {
        options?.onRequest?.();

        const { callbackURL, ...signInData } = params;

        const response = await fetch("/api/auth/sign-in", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(signInData),
        });

        if (!response.ok) {
          const error = await response.json();
          const errorMessage = error.message || "Failed to sign in";
          options?.onError?.({ error: new Error(errorMessage) });
          return { error: { message: errorMessage } };
        }

        const data = await response.json();
        options?.onSuccess?.();
        return { data };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to sign in";
        options?.onError?.({ error: new Error(errorMessage) });
        return { error: { message: errorMessage } };
      }
    },
  },
});
