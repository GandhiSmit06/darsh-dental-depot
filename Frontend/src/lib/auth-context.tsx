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
  setSession: (user: AuthUser, accessToken: string, refreshToken?: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session & listen for Supabase auth state changes
  useEffect(() => {
    let isMounted = true;

    const restore = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          const me = await authApi.getMe();
          if (isMounted) setUser(me.data);
        } else {
          if (isMounted) setUser(null);
        }
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    restore();

    // Realtime auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const me = await authApi.getMe();
          if (isMounted) setUser(me.data);
        } catch {
          if (isMounted) setUser(null);
        }
      } else if (event === "SIGNED_OUT") {
        if (isMounted) {
          setUser(null);
          clearTokens();
        }
      }
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (data: LoginPayload): Promise<AuthUser> => {
    const res = await authApi.login(data);
    setUser(res.data.user);
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

  const setSession = useCallback((authUser: AuthUser, accessToken: string, refreshToken?: string) => {
    setTokens(accessToken, refreshToken || "");
    setUser(authUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
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
