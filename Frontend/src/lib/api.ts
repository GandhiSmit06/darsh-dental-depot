// ─── Centralized API Client ──────────────────────────────────────────────────
// All backend calls go through this module so auth headers are attached automatically.

const API_BASE = "http://localhost:5000/api/v1";

/** Get the stored access token */
export function getAccessToken(): string | null {
  return sessionStorage.getItem("accessToken");
}

/** Persist tokens after login */
export function setTokens(accessToken: string, refreshToken: string) {
  sessionStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}

/** Clear tokens on logout */
export function clearTokens() {
  sessionStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

/** Get the stored refresh token */
export function getRefreshToken(): string | null {
  return localStorage.getItem("refreshToken");
}

interface ApiErrorBody {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export class ApiError extends Error {
  status: number;
  errors?: Array<{ field: string; message: string }>;

  constructor(status: number, message: string, errors?: Array<{ field: string; message: string }>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Make an authenticated request to the backend API.
 * Automatically attaches the Bearer token if available.
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // send cookies
  });

  const body = await res.json();

  if (!res.ok) {
    const errBody = body as ApiErrorBody;
    throw new ApiError(res.status, errBody.message || "Something went wrong", errBody.errors);
  }

  return body as T;
}

// ─── Auth-specific API calls ────────────────────────────────────────────────

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  clinicName?: string;
  address?: string;
  medicalRegistrationNumber?: string;
  role?: "doctor" | "shop_owner";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  _id: string;
  fullName: string;
  email: string;
  role: "admin" | "shop_owner" | "doctor";
  profileImage?: string;
  isVerified: boolean;
}

interface RegisterResponse {
  success: boolean;
  message: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  };
}

interface RefreshResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    accessToken: string;
  };
}

interface MeResponse {
  success: boolean;
  message: string;
  data: AuthUser;
}

export const authApi = {
  register: (data: RegisterPayload) =>
    apiFetch<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: LoginPayload) =>
    apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiFetch("/auth/logout", { method: "POST" }),

  refreshToken: (refreshToken: string) =>
    apiFetch<RefreshResponse>("/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  getMe: () =>
    apiFetch<MeResponse>("/auth/me"),
};
