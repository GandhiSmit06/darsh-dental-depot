import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import {
  authApi,
  setTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  type AuthUser,
  type RegisterPayload,
  type LoginPayload,
  ApiError,
} from "./api";

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

  // Try to restore session on mount
  useEffect(() => {
    const restore = async () => {
      const token = getAccessToken();
      const refreshToken = getRefreshToken();

      if (token) {
        try {
          const res = await authApi.getMe();
          setUser(res.data);
        } catch {
          // Access token expired, try refreshing
          if (refreshToken) {
            try {
              const res = await authApi.refreshToken(refreshToken);
              setTokens(res.data.accessToken, refreshToken);
              setUser(res.data.user);
            } catch {
              clearTokens();
            }
          } else {
            clearTokens();
          }
        }
      } else if (refreshToken) {
        try {
          const res = await authApi.refreshToken(refreshToken);
          setTokens(res.data.accessToken, refreshToken);
          setUser(res.data.user);
        } catch {
          clearTokens();
        }
      }

      setIsLoading(false);
    };

    restore();
  }, []);

  const login = useCallback(async (data: LoginPayload): Promise<AuthUser> => {
    const res = await authApi.login(data);
    setTokens(res.data.accessToken, res.data.refreshToken);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (data: RegisterPayload): Promise<string> => {
    const res = await authApi.register(data);
    return res.message;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if backend logout fails, clear local state
    }
    clearTokens();
    setUser(null);
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
