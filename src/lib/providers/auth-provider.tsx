"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthApiService } from "@/lib/services/auth-api";
import { SessionManager } from "@/lib/services/session-manager";
import { AuthUserResponse, AuthError, StoredSession } from "@/lib/types/auth";

type AuthContextType = {
  user: AuthUserResponse | null;
  session: StoredSession | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{
    error: AuthError | null;
    data: { user: AuthUserResponse | null; session: StoredSession | null };
  }>;
  signUp: (
    email: string,
    password: string,
    name?: string
  ) => Promise<{
    error: AuthError | null;
    data: { user: AuthUserResponse | null; session: StoredSession | null };
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    data: object | null;
    error: AuthError | null;
  }>;
  sendMagicLink: (email: string) => Promise<{
    data: object | null;
    error: AuthError | null;
  }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUserResponse | null>(null);
  const [session, setSession] = useState<StoredSession | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if there's a stored session
        const storedSession = SessionManager.getSession();

        if (storedSession) {
          // Verify the session is still valid by fetching current user
          try {
            const currentUser = await AuthApiService.getCurrentUser();
            setSession(storedSession);
            setUser(currentUser);

            // Refresh queries when auth state changes
            queryClient.invalidateQueries({ queryKey: ["user-profile"] });
          } catch (error) {
            // Session is invalid, clear it
            console.error("Session validation failed:", error);
            SessionManager.clearSession();
            setSession(null);
            setUser(null);
          }
        } else {
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [queryClient]);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await AuthApiService.signIn({ email, password });
      const newSession = SessionManager.getSession();

      setSession(newSession);
      setUser(response.user);

      // Refresh queries when auth state changes
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });

      return {
        error: null,
        data: { user: response.user, session: newSession },
      };
    } catch (error) {
      const authError = error as AuthError;
      return {
        error: authError,
        data: { user: null, session: null },
      };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const response = await AuthApiService.signUp({
        email,
        password,
        data: name ? { name } : undefined,
      });
      const newSession = SessionManager.getSession();

      setSession(newSession);
      setUser(response.user);

      // Refresh queries when auth state changes
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });

      return {
        error: null,
        data: { user: response.user, session: newSession },
      };
    } catch (error) {
      const authError = error as AuthError;
      return {
        error: authError,
        data: { user: null, session: null },
      };
    }
  };

  const signOut = async () => {
    try {
      await AuthApiService.signOut();
    } catch (error) {
      console.error("Error during sign out:", error);
    } finally {
      // Always clear local state regardless of API response
      setSession(null);
      setUser(null);
      queryClient.clear();
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const response = await AuthApiService.resetPassword({ email });
      return {
        data: response,
        error: null,
      };
    } catch (error) {
      const authError = error as AuthError;
      return {
        data: null,
        error: authError,
      };
    }
  };

  const sendMagicLink = async (email: string) => {
    try {
      const response = await AuthApiService.sendMagicLink({ email });
      return {
        data: response,
        error: null,
      };
    } catch (error) {
      const authError = error as AuthError;
      return {
        data: null,
        error: authError,
      };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    sendMagicLink,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
