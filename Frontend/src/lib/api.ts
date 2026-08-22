// ─── Centralized API Client ──────────────────────────────────────────────────
// All backend calls go through this module so auth headers are attached automatically.

const API_BASE = "http://localhost:5000/api/v1";

/** Get the stored access token */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("accessToken");
}

/** Persist tokens after login */
export function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}

/** Clear tokens on logout */
export function clearTokens() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

/** Get the stored refresh token */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
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
    apiFetch<RegisterResponse>("/auth/register-otp/send", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  sendRegisterOtp: (data: RegisterPayload) =>
    apiFetch<{ success: boolean; message: string; data?: { devOtp?: string } }>("/auth/register-otp/send", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyRegisterOtp: (data: { email: string; otp: string }) =>
    apiFetch<LoginResponse>("/auth/register-otp/verify", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email?: string; phone?: string; identifier?: string; password?: string }) =>
    apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  sendLoginOtp: (data: { identifier: string }) =>
    apiFetch<{ success: boolean; message: string; data?: { devOtp?: string } }>("/auth/login-otp/send", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyLoginOtp: (data: { identifier: string; otp: string }) =>
    apiFetch<LoginResponse>("/auth/login-otp/verify", {
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

  forgotPassword: (email: string) =>
    apiFetch<{ success: boolean; message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string, confirmPassword: string) =>
    apiFetch<{ success: boolean; message: string }>(`/auth/reset-password/${token}`, {
      method: "POST",
      body: JSON.stringify({ password, confirmPassword }),
    }),
};

// ─── Shop-specific API calls ────────────────────────────────────────────────

export interface ApiOk<T> {
  success: true;
  message: string;
  data: T;
}

export interface ShopProduct {
  _id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  imageUrl: string;
  status: string;
}

export interface CreateProductPayload {
  name: string;
  category: string;
  description: string;
  SKU: string;
  stock: number;
  purchasePrice: number;
  sellingPrice: number;
  brand?: string;
  manufacturer?: string;
  hsnCode?: string;
  gstPercentage?: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface ShopInventoryItem {
  _id: string;
  sku: string;
  productName: string;
  stock: number;
  status: string;
}

export interface ShopOrder {
  _id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  itemCount: number;
  total: number;
  status: string;
  paymentStatus: string;
  date: string;
}

export interface ShopStats {
  totalSales: number;
  revenue: number;
  orders: number;
  customers: number;
  weeklyChanges: {
    sales: number;
    revenue: number;
    orders: number;
    customers: number;
  };
}

export interface WeeklySalesItem {
  day: string;
  sales: number;
}

export interface MonthlyTrendItem {
  month: string;
  sales: number;
  orders: number;
}

export interface CategoryShareItem {
  name: string;
  value: number;
}

export interface ProductPerformanceItem {
  productName: string;
  unitsSold: number;
}

export interface ShopCustomer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  clinicName?: string;
  orders: number;
  spent: number;
}

export const shopApi = {
  getStats: () => apiFetch<ApiOk<ShopStats>>("/shop/stats"),
  getProducts: () => apiFetch<ApiOk<ShopProduct[]>>("/shop/products"),
  getInventory: () => apiFetch<ApiOk<ShopInventoryItem[]>>("/shop/inventory"),
  getOrders: () => apiFetch<ApiOk<ShopOrder[]>>("/shop/orders"),
  getOrderInvoice: (id: string) => apiFetch<ApiOk<unknown>>(`/shop/orders/${id}/invoice`),
  getCustomers: () => apiFetch<ApiOk<ShopCustomer[]>>("/shop/customers"),
  getWeeklySales: () => apiFetch<ApiOk<WeeklySalesItem[]>>("/shop/analytics/weekly-sales"),
  getMonthlyTrend: () => apiFetch<ApiOk<MonthlyTrendItem[]>>("/shop/analytics/monthly-trend"),
  getCategoryShare: () => apiFetch<ApiOk<CategoryShareItem[]>>("/shop/analytics/category-share"),
  getProductPerformance: () => apiFetch<ApiOk<ProductPerformanceItem[]>>("/shop/analytics/product-performance"),
  createProduct: (data: CreateProductPayload) => apiFetch<ApiOk<ShopProduct>>("/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id: string, data: Partial<CreateProductPayload>) => apiFetch<ApiOk<ShopProduct>>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProduct: (id: string) => apiFetch<ApiOk<null>>(`/products/${id}`, { method: "DELETE" }),
};

// ─── Doctor-specific API calls ──────────────────────────────────────────────

export interface DoctorProfile {
  name: string;
  email: string;
  clinicName: string;
  phone: string;
  address?: string;
}

export interface DoctorStats {
  activeOrders: number;
  wishlistCount: number;
  totalSpent: number;
  cartItems: number;
  spentChangePercent: number;
}

export interface DoctorCartItem {
  cartItemId: string;
  productId: string;
  name: string;
  brand: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

export interface DoctorWishlistItem {
  wishlistItemId: string;
  productId: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
}

export interface DoctorActiveOrder {
  id: string;
  orderId: string;
  itemCount: number;
  total: number;
  status: string;
}

export interface DoctorOrderHistoryItem {
  orderId: string;
  itemCount: number;
  total: number;
  status: string;
  date: string;
}

export interface ProductResponse {
  _id: string;
  name: string;
  brand: string;
  category: string;
  sellingPrice: number;
  stock: number;
  rating: number;
  reviewCount: number;
  images: string[];
}

export const doctorApi = {
  getProfile: () => apiFetch<ApiOk<DoctorProfile>>("/doctor/profile"),
  getStats: () => apiFetch<ApiOk<DoctorStats>>("/doctor/stats"),
  getCart: () => apiFetch<ApiOk<DoctorCartItem[]>>("/doctor/cart"),
  addToCart: (productId: string, quantity: number = 1) => 
    apiFetch<ApiOk<DoctorCartItem[]>>("/doctor/cart", { method: "POST", body: JSON.stringify({ productId, quantity }) }),
  updateCartItem: (id: string, quantity: number) => 
    apiFetch<ApiOk<DoctorCartItem[]>>(`/doctor/cart/${id}`, { method: "PATCH", body: JSON.stringify({ quantity }) }),
  removeFromCart: (id: string) => 
    apiFetch<ApiOk<DoctorCartItem[]>>(`/doctor/cart/${id}`, { method: "DELETE" }),
  getWishlist: () => apiFetch<ApiOk<DoctorWishlistItem[]>>("/doctor/wishlist"),
  addToWishlist: (productId: string) => 
    apiFetch<ApiOk<DoctorWishlistItem[]>>("/doctor/wishlist", { method: "POST", body: JSON.stringify({ productId }) }),
  removeFromWishlist: (id: string) => 
    apiFetch<ApiOk<DoctorWishlistItem[]>>(`/doctor/wishlist/${id}`, { method: "DELETE" }),
  getActiveOrder: () => apiFetch<ApiOk<DoctorActiveOrder | null>>("/doctor/orders/active"),
  getOrderHistory: () => apiFetch<ApiOk<DoctorOrderHistoryItem[]>>("/doctor/orders/history"),
  placeOrder: () => apiFetch<ApiOk<{ orderId: string, razorpayOrderId: string, total: number }>>("/doctor/orders", { method: "POST" }),
  cancelOrder: (id: string) => apiFetch<ApiOk<unknown>>(`/doctor/orders/${id}/cancel`, { method: "POST" }),
  updateProfile: (data: { address: string }) => apiFetch<ApiOk<unknown>>("/doctor/profile", { method: "PUT", body: JSON.stringify(data) }),
  verifyRazorpayPayment: (data: { razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string, orderId: string }) => apiFetch<ApiOk<unknown>>("/payments/razorpay/verify", { method: "POST", body: JSON.stringify(data) }),
};

// ─── Products API calls ─────────────────────────────────────────────────────

export const productsApi = {
  getProducts: (recommended = false) => 
    apiFetch<ApiOk<ProductResponse[]>>(`/products${recommended ? '?recommended=true&limit=4' : '?limit=100'}`),
  getProductById: (id: string) => 
    apiFetch<ApiOk<ProductResponse>>(`/products/${id}`),
};

// ─── User / Admin-specific API calls ────────────────────────────────────────

export interface UserListResponse {
  success: true;
  message: string;
  data: {
    users: User[];
    meta: {
      current: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: "admin" | "shop_owner" | "doctor";
  phone: string;
  clinicName?: string;
  address?: string;
  profileImage?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const userApi = {
  getAllUsers: () =>
    apiFetch<UserListResponse>("/users", {
      method: "GET",
    }),

  getUserById: (id: string) =>
    apiFetch<{ success: true; message: string; data: User }>(`/users/${id}`, {
      method: "GET",
    }),

  updateUser: (id: string, data: Partial<User>) =>
    apiFetch<{ success: true; message: string; data: User }>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteUser: (id: string) =>
    apiFetch<{ success: true; message: string }>(`/users/${id}`, {
      method: "DELETE",
    }),
};

export const adminApi = {
  ...userApi,
  getDashboardData: () => apiFetch<ApiOk<any>>("/admin/dashboard"),
  getUsers: () => apiFetch<ApiOk<User[]>>("/admin/users"),
  deleteUser: (id: string) => apiFetch<ApiOk<{ id: string }>>(`/admin/users/${id}`, { method: "DELETE" }),
  updateUserStatus: (id: string, data: { isActive?: boolean; isVerified?: boolean }) => apiFetch<ApiOk<User>>(`/admin/users/${id}/status`, { method: "PATCH", body: JSON.stringify(data) }),
};

export const uploadApi = {
  uploadImage: async (file: File, folder = "products"): Promise<string> => {
    const token = getAccessToken();
    const formData = new FormData();
    formData.append("image", file);

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/upload/image?folder=${folder}`, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });

    const body = await res.json();
    if (!res.ok) {
      throw new ApiError(res.status, body.message || "Failed to upload image");
    }
    return body.data?.url;
  },

  uploadMultiple: async (files: File[], folder = "products"): Promise<string[]> => {
    const token = getAccessToken();
    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/upload/images?folder=${folder}`, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });

    const body = await res.json();
    if (!res.ok) {
      throw new ApiError(res.status, body.message || "Failed to upload images");
    }
    return body.data?.urls || [];
  },
};