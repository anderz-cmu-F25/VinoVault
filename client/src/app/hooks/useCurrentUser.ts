import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

export type CurrentUser = {
  clerkId: string;
  email: string;
  username: string;
  profile: Record<string, unknown>;
};

export function useCurrentUser() {
  const { isLoaded: isAuthLoaded, isSignedIn, getToken } = useAuth();
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCurrentUser() {
    if (!isAuthLoaded || !isUserLoaded) return;

    if (!isSignedIn) {
      setUser(null);
      setError("");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const token = await getToken();
      const response = await fetch("/api/me", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to load current user.");
      }

      setUser(result.data ?? null);
    } catch (err: any) {
      setUser(null);
      setError(err.message || "Failed to load current user.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCurrentUser();
  }, [getToken, isAuthLoaded, isSignedIn, isUserLoaded]);

  async function updateUsername(username: string): Promise<void> {
    const token = await getToken();
    const response = await fetch("/api/me/username", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ username }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to update username.");
    }
    setUser(result.data ?? null);
  }

  return {
    user,
    clerkUser,
    isLoading,
    isLoaded: isAuthLoaded && isUserLoaded && !isLoading,
    error,
    updateUsername,
  };
}
