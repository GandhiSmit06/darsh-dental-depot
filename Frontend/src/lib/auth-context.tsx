"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import {
  authApi,
  setTokens,
  clearTokens,
  type AuthUser,
  type RegisterPayload,
  type LoginPayload,
} from "./api";
import { supabase } from "./supabase";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginPayload) => Promise<AuthUser>;
  register: (data: RegisterPayload) => Promise<string>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setSession: (user: AuthUser, accessToken: string, refreshToken?: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session & listen for Supabase auth state changes
  useEffect(() => {
    let revision = 0;
    let timer: ReturnType<typeof setTimeout>;
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user && event !== "INITIAL_SESSION" && event !== "SIGNED_OUT") return;
      const current = ++revision;
      clearTimeout(timer);
      if (event === "SIGNED_OUT") {
        clearTokens();
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Supabase holds its auth lock while dispatching this callback.
      // Fetch the profile after the callback releases the lock.
      timer = setTimeout(async () => {
        try {
          const me = await authApi.getMe();
          if (revision !== current) return;
          setUser(me.data);
          localStorage.setItem("ddd_current_user_id", me.data._id || me.data.id || me.data.email);
        } catch {
          if (revision !== current) return;
          if (!session?.user) clearTokens();
          setUser(null);
        } finally {
          if (revision === current) setIsLoading(false);
        }
      }, 0);
    });

    return () => {
      ++revision;
      clearTimeout(timer);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (data: LoginPayload): Promise<AuthUser> => {
    const res = await authApi.login(data);
    setUser(res.data.user);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "ddd_current_user_id",
        res.data.user._id || res.data.user.id || res.data.user.email,
      );
    }
    return res.data.user;
  }, []);

  const register = useCallback(async (data: RegisterPayload): Promise<string> => {
    const res = await authApi.register(data);
    return res.message;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    clearTokens();
  }, []);

  const setSession = useCallback(
    (authUser: AuthUser, accessToken: string, refreshToken?: string) => {
      setTokens(accessToken, refreshToken || "");
      setUser(authUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("ddd_current_user_id", authUser._id || authUser.id || authUser.email);
      }
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshProfile: async () => {
          const me = await authApi.getMe();
          setUser(me.data);
        },
        setSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
