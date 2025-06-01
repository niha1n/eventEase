"use client";

import { useEffect, useState } from "react";

// Client-side auth utilities
export function useSession() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const data = await response.json();
          setSession(data);
        } else {
          setSession(null);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    // Set up polling for session updates
    const interval = setInterval(fetchSession, 60000); // Poll every minute

    return () => {
      clearInterval(interval);
    };
  }, []);

  return {
    user: session?.user,
    loading,
  };
}

export async function signOut() {
  try {
    const response = await fetch("/api/auth/sign-out", {
      method: "POST",
    });
    return response.ok;
  } catch (error) {
    console.error("Error signing out:", error);
    return false;
  }
}
