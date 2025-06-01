import { createAuthClient } from "better-auth/react";
import { Role } from "@prisma/client";

const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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
  baseURL,
  endpoints: {
    signUp: "/api/auth/[...all]",
    signIn: "/api/auth/sign-in",
    signOut: "/api/auth/sign-out",
    session: "/api/auth/session",
  },
  signUp: {
    email: async (params: SignUpParams, options?: SignUpOptions) => {
      try {
        console.log("[Client] Starting sign-up process:", {
          email: params.email,
          name: params.name,
          hasCallbackURL: !!params.callbackURL,
          baseURL,
        });

        options?.onRequest?.();

        const { callbackURL, ...signUpData } = params;
        console.log("[Client] Sending sign-up request with data:", {
          ...signUpData,
          password: "[REDACTED]",
        });

        const response = await fetch(`${baseURL}/api/auth/[...all]`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...signUpData,
            action: "sign-up",
          }),
        }).catch((fetchError) => {
          console.error("[Client] Network error during fetch:", fetchError);
          throw new Error(
            "Network error: Unable to reach the server. Please check your internet connection and try again."
          );
        });

        console.log("[Client] Received response:", {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
        });

        if (!response.ok) {
          let errorMessage = "Failed to sign up";
          try {
            const error = await response.json();
            console.error("[Client] Sign-up failed:", error);
            errorMessage = error.message || errorMessage;
          } catch (parseError) {
            console.error(
              "[Client] Failed to parse error response:",
              parseError
            );
            errorMessage = `Server error (${response.status}): ${
              response.statusText || "Unknown error"
            }`;
          }
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
      params: { email: string; password: string; callbackURL?: string },
      options?: SignUpOptions
    ) => {
      try {
        options?.onRequest?.();

        const { callbackURL, ...signInData } = params;

        const response = await fetch(`${baseURL}/api/auth/sign-in`, {
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
