"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured, signInWithEmail, signUpWithEmail, signOut as supabaseSignOut } from "./supabase";

// ==========================================
// HIRESPHERE AUTH CONTEXT
// ==========================================

export interface AuthUser {
  id: string;
  email: string;
  role: "candidate" | "employer" | "admin";
  name: string;
  isAuthenticated: boolean;
  authMode: "supabase" | "sandbox";
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string, role: "candidate" | "employer") => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>;
  logout: () => Promise<void>;
  isSupabase: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Determine role from email
function getRoleFromEmail(email: string): "candidate" | "employer" | "admin" {
  const clean = email.trim().toLowerCase();
  if (clean === "admin@hiresphere.ai") return "admin";
  if (clean === "employer@hiresphere.ai" || clean.includes("employer") || clean.includes("techcorp")) return "employer";
  return "candidate";
}

// Get dashboard path for role
export function getDashboardPath(role: "candidate" | "employer" | "admin"): string {
  switch (role) {
    case "admin": return "/dashboard/admin";
    case "employer": return "/dashboard/employer";
    default: return "/dashboard/candidate";
  }
}

// Get name from email (sandbox fallback)
function getNameFromEmail(email: string): string {
  const stored = typeof window !== "undefined" ? localStorage.getItem("hiresphere_user_name") : null;
  if (stored) return stored;
  const clean = email.trim().toLowerCase();
  if (clean === "admin@hiresphere.ai") return "Sandbox Admin";
  if (clean === "employer@hiresphere.ai") return "TechCorp Employer";
  return "Alex Johnson";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isSupabase = isSupabaseConfigured();

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        if (isSupabase) {
          // Check Supabase session
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const email = session.user.email || "";
            const role = getRoleFromEmail(email);
            setUser({
              id: session.user.id,
              email,
              role,
              name: session.user.user_metadata?.name || getNameFromEmail(email),
              isAuthenticated: true,
              authMode: "supabase",
            });
            localStorage.setItem("hiresphere_active_user", email);
          }
        } else {
          // Check localStorage for sandbox session
          const storedEmail = localStorage.getItem("hiresphere_active_user");
          if (storedEmail) {
            const role = getRoleFromEmail(storedEmail);
            setUser({
              id: `sandbox-${storedEmail}`,
              email: storedEmail,
              role,
              name: getNameFromEmail(storedEmail),
              isAuthenticated: true,
              authMode: "sandbox",
            });
          }
        }
      } catch (err) {
        console.error("Auth restore failed:", err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();

    // Listen for Supabase auth changes if configured
    if (isSupabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const email = session.user.email || "";
          const role = getRoleFromEmail(email);
          setUser({
            id: session.user.id,
            email,
            role,
            name: session.user.user_metadata?.name || getNameFromEmail(email),
            isAuthenticated: true,
            authMode: "supabase",
          });
          localStorage.setItem("hiresphere_active_user", email);
        } else {
          setUser(null);
          localStorage.removeItem("hiresphere_active_user");
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isSupabase]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    try {
      const { error: authError, isSandbox } = await signInWithEmail(email, password);

      if (authError && !isSandbox) {
        const msg = typeof authError === "object" && "message" in authError
          ? (authError as { message: string }).message
          : "Authentication failed.";
        setError(msg);
        return { success: false, error: msg };
      }

      const cleanEmail = email.trim().toLowerCase();
      const role = getRoleFromEmail(cleanEmail);

      setUser({
        id: isSandbox ? `sandbox-${cleanEmail}` : `supabase-${Date.now()}`,
        email: cleanEmail,
        role,
        name: getNameFromEmail(cleanEmail),
        isAuthenticated: true,
        authMode: isSandbox ? "sandbox" : "supabase",
      });

      localStorage.setItem("hiresphere_active_user", cleanEmail);
      localStorage.setItem("hiresphere_auth_mode", isSandbox ? "sandbox" : "supabase");
      return { success: true };
    } catch {
      const msg = "Connection error. Please try again.";
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string, role: "candidate" | "employer"): Promise<{ success: boolean; error?: string; needsVerification?: boolean }> => {
    setError(null);
    try {
      const { error: authError, isSandbox } = await signUpWithEmail(email, password);

      if (authError && !isSandbox) {
        const msg = typeof authError === "object" && "message" in authError
          ? (authError as { message: string }).message
          : "Registration failed.";
        setError(msg);
        return { success: false, error: msg };
      }

      const cleanEmail = email.trim().toLowerCase();

      setUser({
        id: isSandbox ? `sandbox-${cleanEmail}` : `supabase-${Date.now()}`,
        email: cleanEmail,
        role,
        name,
        isAuthenticated: true,
        authMode: isSandbox ? "sandbox" : "supabase",
      });

      localStorage.setItem("hiresphere_active_user", cleanEmail);
      localStorage.setItem("hiresphere_user_name", name);
      localStorage.setItem("hiresphere_user_role", role);
      localStorage.setItem("hiresphere_auth_mode", isSandbox ? "sandbox" : "supabase");

      return { success: true, needsVerification: !isSandbox };
    } catch {
      const msg = "Connection error.";
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (isSupabase) {
        await supabaseSignOut();
      }
    } finally {
      setUser(null);
      localStorage.removeItem("hiresphere_active_user");
      localStorage.removeItem("hiresphere_auth_mode");
      localStorage.removeItem("hiresphere_user_name");
      localStorage.removeItem("hiresphere_user_role");
    }
  }, [isSupabase]);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, isSupabase }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
