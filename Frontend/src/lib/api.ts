// ─── Centralized Supabase API Client ──────────────────────────────────────────
// Direct client-side connection to Supabase for Auth, Database (PostgreSQL), and Storage.

import { supabase, type Profile, type Product as SupabaseProduct } from "./supabase";

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

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sb-token") || sessionStorage.getItem("sb-token");
}

export function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("sb-token", accessToken);
  if (refreshToken) localStorage.setItem("sb-refresh-token", refreshToken);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("sb-token");
  localStorage.removeItem("sb-refresh-token");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sb-refresh-token");
}

// ─── Types & Interfaces ─────────────────────────────────────────────────────

export interface AuthUser {
  _id: string;
  id?: string;
  fullName: string;
  email: string;
  role: "admin" | "shop_owner" | "doctor";
  profileImage?: string;
  isVerified: boolean;
  phone?: string;
  clinicName?: string;
  address?: string;
  medicalRegistrationNumber?: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
  clinicName?: string;
  address?: string;
  medicalRegistrationNumber?: string;
  role?: "doctor" | "shop_owner" | "admin";
}

export interface LoginPayload {
  email?: string;
  phone?: string;
  identifier?: string;
  password?: string;
}

export interface ProductResponse {
  _id: string;
  id?: string;
  name: string;
  brand: string;
  category: string;
  sellingPrice: number;
  price?: number;
  purchasePrice?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  images: string[];
  imageUrl?: string;
  SKU?: string;
  sku?: string;
  description?: string;
  batchNumber?: string;
  hsnCode?: string;
  gstPercentage?: number;
  manufacturer?: string;
  discountPrice?: number;
  expiryDate?: string;
  status?: string;
}

export interface ApiOk<T> {
  success: true;
  message: string;
  data: T;
}

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
  stock?: number;
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
  products?: Array<{
    name: string;
    brand: string;
    image?: string;
    quantity: number;
    price: number;
  }>;
  createdAt?: string;
}

export interface DoctorOrderHistoryItem {
  orderId: string;
  itemCount: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentId?: string;
  date: string;
}

export interface PlaceOrderPayload {
  address: {
    clinicName?: string;
    contactName?: string;
    contactPhone?: string;
    street: string;
    landmark?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  paymentMethod: "razorpay" | "cod";
  notes?: string;
}

export interface PlaceOrderResponse {
  orderId: string;
  dbOrderId: string;
  razorpayOrderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  total?: number;
  simulation?: boolean;
  paymentMethod: "razorpay" | "cod";
  message?: string;
}

export interface ShopProduct extends ProductResponse {}
export interface ShopInventoryItem {
  _id: string;
  sku: string;
  productName: string;
  stock: number;
  status: string;
}
export type InventoryItem = ShopInventoryItem;

export interface ShopOrder {
  _id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  clinicName?: string;
  contactPhone?: string;
  itemCount: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  date: string;
  rawDate?: string;
}

export interface CustomerTransactionItem {
  id?: string;
  productId?: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
}

export interface CustomerOrderTransaction {
  id: string;
  orderId: string;
  date: string;
  rawDate: string;
  totalPrice: number;
  subtotal: number;
  taxAmount: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentId?: string;
  shippingAddress?: any;
  notes?: string;
  items: CustomerTransactionItem[];
}

export interface CustomerMonthlySpending {
  year: number;
  month: number;
  monthName: string;
  label: string;
  totalSpent: number;
  ordersCount: number;
  itemsPurchased: Array<{
    name: string;
    quantity: number;
    total: number;
  }>;
}

export interface CustomerYearlySpending {
  year: number;
  totalSpent: number;
  ordersCount: number;
  months: CustomerMonthlySpending[];
}

export interface CustomerHistoryData {
  profile: ShopCustomer;
  lifetimeStats: {
    ltv: number;
    totalOrders: number;
    aov: number;
    firstOrderDate?: string;
    lastOrderDate?: string;
    completedOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    preferredPaymentMethod?: string;
  };
  yearlyBreakdown: CustomerYearlySpending[];
  monthlyTimeline: CustomerMonthlySpending[];
  transactions: CustomerOrderTransaction[];
}

export interface ShopCustomer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  clinicName?: string;
  address?: string;
  medicalRegistrationNumber?: string;
  isVerified?: boolean;
  createdAt?: string;
  memberSince?: string;
  orders: number;
  spent: number;
  aov?: number;
  lastOrderDate?: string;
  statusBreakdown?: {
    delivered: number;
    pending: number;
    processing: number;
    shipped: number;
    cancelled: number;
  };
}
export type CustomerItem = ShopCustomer;

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
export interface CreateProductPayload {
  name: string;
  category: string;
  description?: string;
  SKU?: string;
  sku?: string;
  stock: number;
  purchasePrice: number;
  sellingPrice: number;
  price?: number;
  brand?: string;
  manufacturer?: string;
  images?: string[];
  imageUrl?: string;
  hsnCode?: string;
  gstPercentage?: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface User {
  _id: string;
  id?: string;
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

// ─── Helper: Format Product ─────────────────────────────────────────────────
function mapProduct(p: any): ProductResponse {
  return {
    _id: p.id,
    id: p.id,
    name: p.name,
    brand: p.brand || "Darsh Dental Depot",
    category: p.category,
    sellingPrice: Number(p.selling_price || 0),
    price: Number(p.selling_price || 0),
    purchasePrice: Number(p.purchase_price || 0),
    discountPrice: p.discount_price ? Number(p.discount_price) : undefined,
    stock: Number(p.stock || 0),
    rating: Number(p.rating || 4.8),
    reviewCount: Number(p.review_count || 0),
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ["https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80"],
    imageUrl: Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
    SKU: p.sku || `DDD-${p.id.slice(0, 6).toUpperCase()}`,
    sku: p.sku || `DDD-${p.id.slice(0, 6).toUpperCase()}`,
    description: p.description || "",
    batchNumber: p.batch_number,
    hsnCode: p.hsn_code,
    gstPercentage: Number(p.gst_percentage || 18),
    manufacturer: p.manufacturer,
    expiryDate: p.expiry_date,
    status: p.status || "active",
  };
}

// ─── Helper: Map Profile to AuthUser ────────────────────────────────────────
function mapProfileToUser(profile: any, authEmail?: string): AuthUser {
  return {
    _id: profile.id,
    id: profile.id,
    fullName: profile.full_name || "Doctor",
    email: profile.email || authEmail || "",
    role: (profile.role as any) || "doctor",
    profileImage: profile.profile_image,
    isVerified: profile.is_verified ?? true,
    phone: profile.phone,
    clinicName: profile.clinic_name,
    address: profile.address,
    medicalRegistrationNumber: profile.medical_registration_number,
  };
}

// ─── Local Cart & Wishlist Storage ──────────────────────────────────────────
const CART_KEY = "ddd_cart_items";
const WISHLIST_KEY = "ddd_wishlist_items";

function getLocalCart(): DoctorCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocalCart(items: DoctorCartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function getLocalWishlist(): DoctorWishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocalWishlist(items: DoctorWishlistItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
}

// ─── Authentication API (Supabase Auth) ─────────────────────────────────────

export const authApi = {
  // Sign up doctor and create profile in Supabase
  register: async (data: RegisterPayload) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email.toLowerCase().trim(),
      password: data.password,
      options: {
        data: {
          fullName: data.fullName,
          phone: data.phone,
          clinicName: data.clinicName || "",
          address: data.address || "",
          medicalRegistrationNumber: data.medicalRegistrationNumber || "",
          role: data.role || "doctor",
        },
      },
    });

    if (error) {
      throw new ApiError(400, error.message);
    }

    // Insert or update profile explicitly to ensure immediate availability
    if (authData.user) {
      await supabase.from("profiles").upsert({
        id: authData.user.id,
        email: data.email.toLowerCase().trim(),
        full_name: data.fullName,
        phone: data.phone,
        clinic_name: data.clinicName || "",
        address: data.address || "",
        medical_registration_number: data.medicalRegistrationNumber || "",
        role: data.role || "doctor",
        is_verified: true,
        is_active: true,
      });
    }

    return {
      success: true,
      message: "Doctor registration successful! You can now log in.",
    };
  },

  sendRegisterOtp: async (data: RegisterPayload) => {
    return authApi.register(data);
  },

  verifyRegisterOtp: async (data: { email: string; otp: string }) => {
    // If OTP verification is attempted, get existing session or sign in
    const { data: sessionData, error } = await supabase.auth.getSession();
    if (error || !sessionData.session) {
      throw new ApiError(400, "Registration completed. Please sign in with your password.");
    }
    const profileRes = await supabase.from("profiles").select("*").eq("id", sessionData.session.user.id).single();
    const user = mapProfileToUser(profileRes.data || {}, sessionData.session.user.email);
    return {
      success: true,
      message: "Registration verified!",
      data: {
        user,
        accessToken: sessionData.session.access_token,
        refreshToken: sessionData.session.refresh_token,
      },
    };
  },

  login: async (data: LoginPayload) => {
    let emailToUse = (data.email || data.identifier || "").trim().toLowerCase();

    // If identifier is a phone number, look up the email first
    if (!emailToUse.includes("@") && data.phone) {
      emailToUse = data.phone.trim();
    }
    if (!emailToUse.includes("@")) {
      const cleanPhone = emailToUse.replace(/\D/g, "");
      const { data: phoneProfile } = await supabase
        .from("profiles")
        .select("email")
        .eq("phone", cleanPhone)
        .limit(1)
        .maybeSingle();

      if (phoneProfile?.email) {
        emailToUse = phoneProfile.email;
      }
    }

    if (!data.password) {
      throw new ApiError(400, "Password is required");
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: data.password,
    });

    if (error) {
      throw new ApiError(401, error.message || "Invalid email or password");
    }

    if (!authData.user) {
      throw new ApiError(401, "User not found");
    }

    // Fetch profile
    let profileData: any = null;
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", authData.user.id).maybeSingle();
    
    if (prof) {
      profileData = prof;
    } else {
      // Auto create profile if not yet created
      const meta = authData.user.user_metadata || {};
      const newProf = {
        id: authData.user.id,
        email: authData.user.email || emailToUse,
        full_name: meta.fullName || meta.full_name || "Doctor",
        role: meta.role || "doctor",
        phone: meta.phone || "",
        clinic_name: meta.clinicName || "",
        address: meta.address || "",
        medical_registration_number: meta.medicalRegistrationNumber || "",
        is_verified: true,
        is_active: true,
      };
      await supabase.from("profiles").insert([newProf]);
      profileData = newProf;
    }

    const user = mapProfileToUser(profileData, authData.user.email);
    setTokens(authData.session.access_token, authData.session.refresh_token);

    return {
      success: true,
      message: "Login successful",
      data: {
        user,
        accessToken: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
      },
    };
  },

  sendLoginOtp: async (data: { identifier: string }) => {
    let emailToUse = data.identifier.trim().toLowerCase();

    // If identifier is a phone number without @, look up email
    if (!emailToUse.includes("@")) {
      const cleanPhone = emailToUse.replace(/\D/g, "");
      const { data: phoneProfile } = await supabase
        .from("profiles")
        .select("email")
        .eq("phone", cleanPhone)
        .limit(1)
        .maybeSingle();

      if (phoneProfile?.email) {
        emailToUse = phoneProfile.email;
      }
    }

    if (!emailToUse.includes("@")) {
      throw new ApiError(400, "Please enter a valid registered email address.");
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: emailToUse,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      throw new ApiError(400, error.message || "Failed to send OTP. Please check if your account exists.");
    }

    return {
      success: true,
      message: `A 6-digit login code has been sent to ${emailToUse}.`,
    };
  },

  verifyLoginOtp: async (data: { identifier: string; otp: string }) => {
    let emailToUse = data.identifier.trim().toLowerCase();

    if (!emailToUse.includes("@")) {
      const cleanPhone = emailToUse.replace(/\D/g, "");
      const { data: phoneProfile } = await supabase
        .from("profiles")
        .select("email")
        .eq("phone", cleanPhone)
        .limit(1)
        .maybeSingle();

      if (phoneProfile?.email) {
        emailToUse = phoneProfile.email;
      }
    }

    const { data: authData, error } = await supabase.auth.verifyOtp({
      email: emailToUse,
      token: data.otp.trim(),
      type: "email",
    });

    if (error || !authData.user || !authData.session) {
      throw new ApiError(400, error?.message || "Invalid or expired OTP code.");
    }

    const { data: prof } = await supabase.from("profiles").select("*").eq("id", authData.user.id).maybeSingle();
    const user = mapProfileToUser(prof || {}, authData.user.email);
    setTokens(authData.session.access_token, authData.session.refresh_token);

    return {
      success: true,
      message: "Login successful",
      data: {
        user,
        accessToken: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
      },
    };
  },

  logout: async () => {
    await supabase.auth.signOut();
    clearTokens();
    return { success: true };
  },

  refreshToken: async (token: string) => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session) {
      throw new ApiError(401, "Session expired");
    }
    const profileRes = await supabase.from("profiles").select("*").eq("id", data.session.user.id).maybeSingle();
    const user = mapProfileToUser(profileRes.data || {}, data.session.user.email);
    return {
      success: true,
      message: "Refreshed",
      data: {
        user,
        accessToken: data.session.access_token,
      },
    };
  },

  getMe: async () => {
    const { data: userData, error } = await supabase.auth.getUser();
    if (error || !userData.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userData.user.id).maybeSingle();
    const user = mapProfileToUser(profile || {}, userData.user.email);
    return {
      success: true,
      message: "Profile loaded",
      data: user,
    };
  },

  forgotPassword: async (email: string) => {
    const redirectUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/reset-password`
        : "https://darsh-dental-depot.gsmit5605.workers.dev/reset-password";

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: redirectUrl,
    });
    if (error) throw new ApiError(400, error.message);
    return { success: true, message: "Password reset link sent to your email." };
  },

  resetPassword: async (_token: string, password: string, _confirm: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new ApiError(400, error.message);
    return { success: true, message: "Password updated successfully!" };
  },
};

// ─── Products API (Supabase Database) ───────────────────────────────────────

export const productsApi = {
  getProducts: async (_recommended = false) => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch products:", error);
      return { success: true as const, message: "OK", data: [] };
    }

    const mapped = (data || []).map(mapProduct);
    return { success: true as const, message: "OK", data: mapped };
  },

  getProductById: async (id: string) => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      throw new ApiError(404, "Product not found");
    }

    return { success: true as const, message: "OK", data: mapProduct(data) };
  },
};

// ─── Doctor API ─────────────────────────────────────────────────────────────

export const doctorApi = {
  getProfile: async () => {
    const me = await authApi.getMe();
    return {
      success: true as const,
      message: "OK",
      data: {
        name: me.data.fullName,
        email: me.data.email,
        clinicName: me.data.clinicName || "",
        phone: me.data.phone || "",
        address: me.data.address || "",
      },
    };
  },

  updateProfile: async (data: Partial<DoctorProfile>) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new ApiError(401, "Not logged in");

    await supabase.from("profiles").update({
      full_name: data.name,
      clinic_name: data.clinicName,
      phone: data.phone,
      address: data.address,
    }).eq("id", userData.user.id);

    return { success: true as const, message: "Profile updated" };
  },

  getStats: async () => {
    const { data: userData } = await supabase.auth.getUser();
    const cart = getLocalCart();
    const wishlist = getLocalWishlist();

    let activeOrdersCount = 0;
    let totalSpent = 0;

    if (userData?.user) {
      const { data: orders } = await supabase
        .from("orders")
        .select("total_price, order_status")
        .eq("user_id", userData.user.id);

      if (orders) {
        orders.forEach((o) => {
          totalSpent += Number(o.total_price || 0);
          if (o.order_status !== "delivered" && o.order_status !== "cancelled") {
            activeOrdersCount += 1;
          }
        });
      }
    }

    return {
      success: true as const,
      message: "OK",
      data: {
        activeOrders: activeOrdersCount,
        wishlistCount: wishlist.length,
        totalSpent,
        cartItems: cart.reduce((sum, item) => sum + item.quantity, 0),
        spentChangePercent: 0,
      },
    };
  },

  getCart: async () => {
    const items = getLocalCart();
    return { success: true as const, message: "OK", data: items };
  },

  addToCart: async (productId: string, quantity = 1) => {
    const productRes = await productsApi.getProductById(productId);
    const p = productRes.data;
    const cart = getLocalCart();
    const existing = cart.find((i) => i.productId === productId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        cartItemId: "cart-" + Math.random().toString(36).substr(2, 9),
        productId: p._id,
        name: p.name,
        brand: p.brand,
        imageUrl: p.imageUrl || p.images[0] || "",
        price: p.discountPrice || p.sellingPrice || 0,
        quantity,
        stock: p.stock,
      });
    }

    saveLocalCart(cart);
    return { success: true as const, message: "Added to cart", data: cart };
  },

  updateCartItem: async (id: string, quantity: number) => {
    let cart = getLocalCart();
    if (quantity <= 0) {
      cart = cart.filter((i) => i.cartItemId !== id && i.productId !== id);
    } else {
      cart = cart.map((i) =>
        i.cartItemId === id || i.productId === id ? { ...i, quantity } : i
      );
    }
    saveLocalCart(cart);
    return { success: true as const, message: "Cart updated", data: cart };
  },

  removeFromCart: async (id: string) => {
    const cart = getLocalCart().filter((i) => i.cartItemId !== id && i.productId !== id);
    saveLocalCart(cart);
    return { success: true as const, message: "Removed from cart", data: cart };
  },

  getWishlist: async () => {
    const items = getLocalWishlist();
    return { success: true as const, message: "OK", data: items };
  },

  addToWishlist: async (productId: string) => {
    const productRes = await productsApi.getProductById(productId);
    const p = productRes.data;
    const wishlist = getLocalWishlist();

    if (!wishlist.find((w) => w.productId === productId)) {
      wishlist.push({
        wishlistItemId: "wish-" + Math.random().toString(36).substr(2, 9),
        productId: p._id,
        name: p.name,
        brand: p.brand,
        price: p.discountPrice || p.sellingPrice || 0,
        stock: p.stock,
        rating: p.rating,
        reviewCount: p.reviewCount,
        imageUrl: p.imageUrl || p.images[0] || "",
      });
    }

    saveLocalWishlist(wishlist);
    return { success: true as const, message: "Added to wishlist", data: wishlist };
  },

  removeFromWishlist: async (id: string) => {
    const wishlist = getLocalWishlist().filter((w) => w.wishlistItemId !== id && w.productId !== id);
    saveLocalWishlist(wishlist);
    return { success: true as const, message: "Removed from wishlist", data: wishlist };
  },

  getActiveOrder: async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return { success: true as const, message: "OK", data: null };

    const { data: order } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", userData.user.id)
      .neq("order_status", "delivered")
      .neq("order_status", "cancelled")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!order) return { success: true as const, message: "OK", data: null };

    return {
      success: true as const,
      message: "OK",
      data: {
        id: order.id,
        orderId: order.order_number,
        itemCount: (order.order_items || []).length,
        total: Number(order.total_price),
        status: order.order_status,
        products: (order.order_items || []).map((item: any) => ({
          name: item.name,
          brand: "Darsh Dental Depot",
          image: item.image,
          quantity: item.quantity,
          price: Number(item.price),
        })),
        createdAt: order.created_at,
      },
    };
  },

  getOrderHistory: async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return { success: true as const, message: "OK", data: [] };

    const { data: orders } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    const mapped: DoctorOrderHistoryItem[] = (orders || []).map((o: any) => ({
      orderId: o.order_number,
      itemCount: (o.order_items || []).length,
      total: Number(o.total_price),
      status: o.order_status,
      paymentStatus: o.payment_status || (o.payment_method === "cod" ? "pending" : "paid"),
      paymentMethod: o.payment_method || "cod",
      paymentId: o.payment_id || "",
      date: new Date(o.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

    return { success: true as const, message: "OK", data: mapped };
  },

  placeOrder: async (payload: PlaceOrderPayload) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new ApiError(401, "Please log in to place an order");

    const cart = getLocalCart();
    if (cart.length === 0) throw new ApiError(400, "Your cart is empty");

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxAmount = Math.round(subtotal * 0.18);
    const totalPrice = subtotal + taxAmount;
    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // 1. Insert Order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert([
        {
          order_number: orderNumber,
          user_id: userData.user.id,
          total_price: totalPrice,
          subtotal,
          tax_amount: taxAmount,
          order_status: "pending",
          payment_status: "pending",
          payment_method: payload.paymentMethod,
          shipping_address: payload.address,
          notes: payload.notes || "",
        },
      ])
      .select()
      .single();

    if (orderErr || !order) {
      throw new ApiError(500, orderErr?.message || "Failed to create order");
    }

    // 2. Insert Order Items & decrement stock
    const itemsToInsert = cart.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.imageUrl,
    }));

    await supabase.from("order_items").insert(itemsToInsert);

    // Decrement stock for purchased products in Supabase
    for (const item of cart) {
      try {
        const { data: currentProd } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.productId)
          .single();
        if (currentProd && currentProd.stock !== undefined) {
          const newStock = Math.max(0, currentProd.stock - item.quantity);
          await supabase
            .from("products")
            .update({
              stock: newStock,
              status: newStock > 0 ? "active" : "out_of_stock",
              updated_at: new Date().toISOString(),
            })
            .eq("id", item.productId);
        }
      } catch (e) {
        console.warn("Stock update warning:", e);
      }
    }

    // 3. Clear cart
    saveLocalCart([]);

    return {
      success: true as const,
      message: "Order placed successfully!",
      data: {
        orderId: order.order_number,
        dbOrderId: order.id,
        amount: totalPrice * 100,
        currency: "INR",
        total: totalPrice,
        paymentMethod: payload.paymentMethod,
        message: "Order confirmed for Vadodara clinic dispatch!",
      },
    };
  },

  cancelOrder: async (id: string) => {
    // 1. Restore stock for order items
    try {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", id);

      if (items && items.length > 0) {
        for (const item of items) {
          if (!item.product_id) continue;
          const { data: prod } = await supabase
            .from("products")
            .select("stock")
            .eq("id", item.product_id)
            .single();
          if (prod && prod.stock !== undefined) {
            const restoredStock = prod.stock + (item.quantity || 1);
            await supabase
              .from("products")
              .update({
                stock: restoredStock,
                status: "active",
                updated_at: new Date().toISOString(),
              })
              .eq("id", item.product_id);
          }
        }
      }
    } catch (e) {
      console.warn("Stock restore warning:", e);
    }

    // 2. Update order status in Supabase
    const { error } = await supabase
      .from("orders")
      .update({
        order_status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Cancel order error:", error);
      throw new ApiError(400, error.message || "Failed to cancel order");
    }

    return { success: true as const, message: "Order cancelled successfully" };
  },

  verifyRazorpayPayment: async (data: {
    orderId: string;
    razorpayOrderId?: string;
    razorpayPaymentId: string;
    razorpaySignature?: string;
  }) => {
    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        payment_method: "razorpay",
        payment_id: data.razorpayPaymentId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.orderId);

    if (error) {
      console.error("Failed to update payment status:", error);
      throw new ApiError(500, "Failed to record payment in database");
    }

    return { success: true as const, message: "Payment verified successfully" };
  },
};

// ─── Shop & Admin API ───────────────────────────────────────────────────────

export const shopApi = {
  getProducts: async () => {
    const res = await productsApi.getProducts();
    return { success: true as const, message: "OK", data: res.data as ShopProduct[] };
  },

  createProduct: async (data: CreateProductPayload) => {
    const { data: prod, error } = await supabase
      .from("products")
      .insert([
        {
          name: data.name,
          category: data.category,
          description: data.description || "",
          brand: data.brand || "Darsh Dental Depot",
          manufacturer: data.manufacturer || "",
          purchase_price: data.purchasePrice || 0,
          selling_price: data.sellingPrice || data.price || 0,
          stock: data.stock || 0,
          images: data.images || (data.imageUrl ? [data.imageUrl] : []),
          hsn_code: data.hsnCode,
          gst_percentage: data.gstPercentage || 18,
          batch_number: data.batchNumber,
          status: data.stock > 0 ? "active" : "out_of_stock",
        },
      ])
      .select()
      .single();

    if (error || !prod) throw new ApiError(400, error?.message || "Failed to create product");
    return { success: true as const, message: "Product created", data: mapProduct(prod) };
  },

  updateProduct: async (id: string, data: Partial<CreateProductPayload>) => {
    const updateObj: any = {};
    if (data.name) updateObj.name = data.name;
    if (data.category) updateObj.category = data.category;
    if (data.description !== undefined) updateObj.description = data.description;
    if (data.brand !== undefined) updateObj.brand = data.brand;
    if (data.manufacturer !== undefined) updateObj.manufacturer = data.manufacturer;
    if (data.purchasePrice !== undefined) updateObj.purchase_price = data.purchasePrice;
    if (data.sellingPrice !== undefined) updateObj.selling_price = data.sellingPrice;
    if (data.stock !== undefined) {
      updateObj.stock = data.stock;
      updateObj.status = data.stock > 0 ? "active" : "out_of_stock";
    }
    if (data.images !== undefined) updateObj.images = data.images;
    if (data.hsnCode !== undefined) updateObj.hsn_code = data.hsnCode;
    if (data.gstPercentage !== undefined) updateObj.gst_percentage = data.gstPercentage;
    if (data.batchNumber !== undefined) updateObj.batch_number = data.batchNumber;

    const { data: prod, error } = await supabase
      .from("products")
      .update(updateObj)
      .eq("id", id)
      .select()
      .single();

    if (error || !prod) throw new ApiError(400, error?.message || "Failed to update product");
    return { success: true as const, message: "Product updated", data: mapProduct(prod) };
  },

  deleteProduct: async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new ApiError(400, error.message);
    return { success: true as const, message: "Product deleted", data: null };
  },

  getOrders: async () => {
    const { data: orders } = await supabase
      .from("orders")
      .select("*, profiles(full_name, email, phone, clinic_name), order_items(*)")
      .order("created_at", { ascending: false });

    const mapped: ShopOrder[] = (orders || []).map((o: any) => {
      const orderDate = new Date(o.created_at);
      return {
        _id: o.id,
        orderId: o.order_number,
        customerName: o.profiles?.full_name || o.shipping_address?.contactName || "Doctor",
        customerEmail: o.profiles?.email || "",
        clinicName: o.profiles?.clinic_name || o.shipping_address?.clinicName || "",
        contactPhone: o.profiles?.phone || o.shipping_address?.contactPhone || "",
        itemCount: (o.order_items || []).length,
        total: Number(o.total_price),
        status: o.order_status,
        paymentStatus: o.payment_status || (o.payment_method === "cod" ? "pending" : "paid"),
        paymentMethod: o.payment_method || "cod",
        paymentId: o.payment_id || "",
        date: orderDate.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        rawDate: o.created_at,
      };
    });

    return { success: true as const, message: "OK", data: mapped };
  },

  updateOrderStatus: async (id: string, status: string) => {
    await supabase.from("orders").update({ order_status: status.toLowerCase() }).eq("id", id);
    return { success: true as const, message: "Order status updated", data: null };
  },

  getStats: async () => {
    const { data: orders } = await supabase.from("orders").select("total_price, order_status, created_at");
    const { data: customers } = await supabase.from("profiles").select("id, created_at").eq("role", "doctor");

    const validOrders = (orders || []).filter((o) => o.order_status !== "cancelled");
    const revenue = validOrders.reduce((sum, o) => sum + Number(o.total_price || 0), 0);
    const totalOrdersCount = (orders || []).length;
    const totalCustomersCount = (customers || []).length;

    // Calculate real week-over-week changes
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const thisWeekOrders = (orders || []).filter((o) => new Date(o.created_at) >= oneWeekAgo);
    const prevWeekOrders = (orders || []).filter(
      (o) => new Date(o.created_at) >= twoWeeksAgo && new Date(o.created_at) < oneWeekAgo
    );

    const thisWeekRev = thisWeekOrders.reduce((s, o) => s + Number(o.total_price || 0), 0);
    const prevWeekRev = prevWeekOrders.reduce((s, o) => s + Number(o.total_price || 0), 0);

    const calcChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    return {
      success: true as const,
      message: "OK",
      data: {
        totalSales: validOrders.length,
        revenue,
        orders: totalOrdersCount,
        customers: totalCustomersCount,
        weeklyChanges: {
          sales: calcChange(thisWeekOrders.length, prevWeekOrders.length),
          revenue: calcChange(thisWeekRev, prevWeekRev),
          orders: calcChange(thisWeekOrders.length, prevWeekOrders.length),
          customers: 0,
        },
      },
    };
  },

  getInventory: async () => {
    const { data: products } = await supabase
      .from("products")
      .select("id, sku, name, stock, status")
      .order("created_at", { ascending: false });

    const mapped = (products || []).map((p: any) => ({
      _id: p.id,
      sku: p.sku || `DDD-${p.id.slice(0, 6)}`,
      productName: p.name,
      stock: p.stock,
      status: p.status,
    }));
    return { success: true as const, message: "OK", data: mapped };
  },

  getCustomers: async () => {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "doctor")
      .order("created_at", { ascending: false });

    const { data: orders } = await supabase
      .from("orders")
      .select("user_id, total_price, order_status, created_at")
      .order("created_at", { ascending: false });

    // Aggregate real orders and spending per doctor
    const ordersByUser: Record<
      string,
      {
        count: number;
        spent: number;
        lastOrderDate?: string;
        delivered: number;
        pending: number;
        processing: number;
        shipped: number;
        cancelled: number;
      }
    > = {};

    (orders || []).forEach((o: any) => {
      if (!o.user_id) return;
      if (!ordersByUser[o.user_id]) {
        ordersByUser[o.user_id] = {
          count: 0,
          spent: 0,
          lastOrderDate: o.created_at,
          delivered: 0,
          pending: 0,
          processing: 0,
          shipped: 0,
          cancelled: 0,
        };
      }
      ordersByUser[o.user_id].count += 1;
      const status = (o.order_status || "pending").toLowerCase();
      if (status === "delivered") ordersByUser[o.user_id].delivered += 1;
      else if (status === "cancelled") ordersByUser[o.user_id].cancelled += 1;
      else if (status === "shipped") ordersByUser[o.user_id].shipped += 1;
      else if (status === "processing") ordersByUser[o.user_id].processing += 1;
      else ordersByUser[o.user_id].pending += 1;

      if (o.order_status !== "cancelled") {
        ordersByUser[o.user_id].spent += Number(o.total_price || 0);
      }
    });

    const mapped: ShopCustomer[] = (profiles || []).map((p: any) => {
      const stats = ordersByUser[p.id] || {
        count: 0,
        spent: 0,
        delivered: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        cancelled: 0,
      };
      const aov = stats.count > 0 ? Math.round(stats.spent / stats.count) : 0;
      const memberSince = p.created_at
        ? new Date(p.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "—";

      return {
        _id: p.id,
        name: p.full_name || "Doctor",
        email: p.email,
        phone: p.phone || "",
        clinicName: p.clinic_name || "",
        address: p.address || "",
        medicalRegistrationNumber: p.medical_registration_number || "",
        isVerified: p.is_verified ?? false,
        createdAt: p.created_at,
        memberSince,
        orders: stats.count,
        spent: stats.spent,
        aov,
        lastOrderDate: stats.lastOrderDate
          ? new Date(stats.lastOrderDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : undefined,
        statusBreakdown: {
          delivered: stats.delivered,
          pending: stats.pending,
          processing: stats.processing,
          shipped: stats.shipped,
          cancelled: stats.cancelled,
        },
      };
    });

    return { success: true as const, message: "OK", data: mapped };
  },

  getCustomerHistory: async (customerId: string) => {
    // 1. Fetch profile
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", customerId)
      .single();

    if (profileErr || !profile) {
      throw new ApiError(404, "Customer not found");
    }

    // 2. Fetch all orders with order_items
    const { data: orders, error: ordersErr } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", customerId)
      .order("created_at", { ascending: false });

    if (ordersErr) {
      throw new ApiError(500, "Failed to load customer orders");
    }

    // 3. Map transactions
    const transactions: CustomerOrderTransaction[] = (orders || []).map((o: any) => {
      const items: CustomerTransactionItem[] = (o.order_items || []).map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        name: item.name,
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
        total: Number(item.quantity || 1) * Number(item.price || 0),
        image: item.image,
      }));

      return {
        id: o.id,
        orderId: o.order_number,
        date: new Date(o.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        rawDate: o.created_at,
        totalPrice: Number(o.total_price || 0),
        subtotal: Number(o.subtotal || o.total_price || 0),
        taxAmount: Number(o.tax_amount || 0),
        orderStatus: o.order_status || "pending",
        paymentStatus: o.payment_status || (o.payment_method === "cod" ? "pending" : "paid"),
        paymentMethod: o.payment_method || "cod",
        paymentId: o.payment_id || undefined,
        shippingAddress: o.shipping_address,
        notes: o.notes,
        items,
      };
    });

    // 4. Calculate Lifetime Stats
    const totalOrders = transactions.length;
    const validOrders = transactions.filter((t) => t.orderStatus !== "cancelled");
    const ltv = validOrders.reduce((sum, t) => sum + t.totalPrice, 0);
    const aov = validOrders.length > 0 ? Math.round(ltv / validOrders.length) : 0;
    const completedOrders = transactions.filter((t) => t.orderStatus === "delivered").length;
    const pendingOrders = transactions.filter(
      (t) => t.orderStatus === "pending" || t.orderStatus === "processing" || t.orderStatus === "shipped"
    ).length;
    const cancelledOrders = transactions.filter((t) => t.orderStatus === "cancelled").length;

    // Payment methods counts
    const methodCounts: Record<string, number> = {};
    transactions.forEach((t) => {
      methodCounts[t.paymentMethod] = (methodCounts[t.paymentMethod] || 0) + 1;
    });
    const preferredPaymentMethod = Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    const firstOrderDate =
      transactions.length > 0
        ? new Date(transactions[transactions.length - 1].rawDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : undefined;

    const lastOrderDate =
      transactions.length > 0
        ? new Date(transactions[0].rawDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : undefined;

    // 5. Month-by-Month & Year-by-Year Aggregations
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthMap: Record<string, CustomerMonthlySpending> = {};
    const yearMap: Record<string, CustomerYearlySpending> = {};

    // Sort chronologically ascending for timeline grouping
    const chronoOrders = [...transactions].reverse();

    chronoOrders.forEach((o) => {
      const d = new Date(o.rawDate);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const monthKey = `${year}-${String(month).padStart(2, "0")}`;
      const yearKey = `${year}`;

      // Initialize monthly bucket
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = {
          year,
          month,
          monthName: monthNames[month - 1],
          label: `${monthNames[month - 1]} ${year}`,
          totalSpent: 0,
          ordersCount: 0,
          itemsPurchased: [],
        };
      }

      // Initialize yearly bucket
      if (!yearMap[yearKey]) {
        yearMap[yearKey] = {
          year,
          totalSpent: 0,
          ordersCount: 0,
          months: [],
        };
      }

      monthMap[monthKey].ordersCount += 1;
      yearMap[yearKey].ordersCount += 1;

      if (o.orderStatus !== "cancelled") {
        monthMap[monthKey].totalSpent += o.totalPrice;
        yearMap[yearKey].totalSpent += o.totalPrice;
      }

      // Aggregate items purchased in that month
      o.items.forEach((item) => {
        const existingItem = monthMap[monthKey].itemsPurchased.find((i) => i.name === item.name);
        if (existingItem) {
          existingItem.quantity += item.quantity;
          existingItem.total += item.total;
        } else {
          monthMap[monthKey].itemsPurchased.push({
            name: item.name,
            quantity: item.quantity,
            total: item.total,
          });
        }
      });
    });

    const monthlyTimeline = Object.values(monthMap).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

    // Populate yearly months
    Object.values(yearMap).forEach((y) => {
      y.months = monthlyTimeline.filter((m) => m.year === y.year);
    });

    const yearlyBreakdown = Object.values(yearMap).sort((a, b) => b.year - a.year);

    const customerProfile: ShopCustomer = {
      _id: profile.id,
      name: profile.full_name || "Doctor",
      email: profile.email,
      phone: profile.phone || "",
      clinicName: profile.clinic_name || "",
      address: profile.address || "",
      medicalRegistrationNumber: profile.medical_registration_number || "",
      isVerified: profile.is_verified ?? false,
      createdAt: profile.created_at,
      memberSince: profile.created_at
        ? new Date(profile.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "—",
      orders: totalOrders,
      spent: ltv,
      aov,
      lastOrderDate,
      statusBreakdown: {
        delivered: completedOrders,
        pending: pendingOrders,
        processing: 0,
        shipped: 0,
        cancelled: cancelledOrders,
      },
    };

    const historyData: CustomerHistoryData = {
      profile: customerProfile,
      lifetimeStats: {
        ltv,
        totalOrders,
        aov,
        firstOrderDate,
        lastOrderDate,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        preferredPaymentMethod,
      },
      yearlyBreakdown,
      monthlyTimeline,
      transactions,
    };

    return { success: true as const, message: "OK", data: historyData };
  },

  getWeeklySales: async () => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();
    const startOfWeek = new Date(now);
    const dayIndex = now.getDay(); // 0 = Sun
    const diffToMonday = (dayIndex + 6) % 7;
    startOfWeek.setDate(now.getDate() - diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const { data: orders } = await supabase
      .from("orders")
      .select("total_price, created_at, order_status")
      .gte("created_at", startOfWeek.toISOString())
      .neq("order_status", "cancelled");

    const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const salesByDay: Record<string, number> = {
      Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0,
    };

    (orders || []).forEach((o) => {
      const d = new Date(o.created_at);
      const name = dayNames[d.getDay()];
      if (salesByDay[name] !== undefined) {
        salesByDay[name] += Number(o.total_price || 0);
      }
    });

    const result = daysOrder.map((day) => ({
      day,
      sales: salesByDay[day],
    }));

    return { success: true as const, message: "OK", data: result };
  },

  getMonthlyTrend: async () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const resultMonths: { month: string; sales: number; orders: number; key: string }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const name = monthNames[d.getMonth()];
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      resultMonths.push({ month: name, sales: 0, orders: 0, key });
    }

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const { data: orders } = await supabase
      .from("orders")
      .select("total_price, created_at, order_status")
      .gte("created_at", sixMonthsAgo.toISOString());

    (orders || []).forEach((o) => {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const entry = resultMonths.find((m) => m.key === key);
      if (entry) {
        entry.orders += 1;
        if (o.order_status !== "cancelled") {
          entry.sales += Number(o.total_price || 0);
        }
      }
    });

    const mapped = resultMonths.map(({ month, sales, orders }) => ({ month, sales, orders }));
    return { success: true as const, message: "OK", data: mapped };
  },

  getCategoryShare: async () => {
    const { data: products } = await supabase.from("products").select("category");

    const counts: Record<string, number> = {};
    (products || []).forEach((p) => {
      const cat = p.category || "General";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const mapped = Object.entries(counts).map(([name, value]) => ({ name, value }));
    return { success: true as const, message: "OK", data: mapped };
  },

  getProductPerformance: async () => {
    const { data: items } = await supabase.from("order_items").select("name, quantity");

    const unitsByName: Record<string, number> = {};
    (items || []).forEach((item) => {
      unitsByName[item.name] = (unitsByName[item.name] || 0) + Number(item.quantity || 1);
    });

    let mapped = Object.entries(unitsByName)
      .map(([productName, unitsSold]) => ({ productName, unitsSold }))
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    if (mapped.length === 0) {
      const { data: prods } = await supabase.from("products").select("name").limit(3);
      mapped = (prods || []).map((p) => ({ productName: p.name, unitsSold: 0 }));
    }

    return { success: true as const, message: "OK", data: mapped };
  },

  getOrderInvoice: async (_id: string) => ({
    success: true as const,
    message: "OK",
    data: {},
  }),
};

export const orderApi = {
  updateStatus: shopApi.updateOrderStatus,
  cancelOrder: doctorApi.cancelOrder,
};

// ─── Admin API ──────────────────────────────────────────────────────────────

export const userApi = {
  getAllUsers: async () => {
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const users: User[] = (profiles || []).map((p: any) => ({
      _id: p.id,
      id: p.id,
      fullName: p.full_name,
      email: p.email,
      role: p.role,
      phone: p.phone || "",
      clinicName: p.clinic_name,
      address: p.address,
      profileImage: p.profile_image,
      isVerified: p.is_verified,
      isActive: p.is_active,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));
    return {
      success: true as const,
      message: "OK",
      data: {
        users,
        meta: { current: 1, pageSize: users.length, total: users.length, totalPages: 1 },
      },
    };
  },

  getUserById: async (id: string) => {
    const { data: p } = await supabase.from("profiles").select("*").eq("id", id).single();
    if (!p) throw new ApiError(404, "User not found");
    return {
      success: true as const,
      message: "OK",
      data: {
        _id: p.id,
        id: p.id,
        fullName: p.full_name,
        email: p.email,
        role: p.role,
        phone: p.phone || "",
        clinicName: p.clinic_name,
        address: p.address,
        profileImage: p.profile_image,
        isVerified: p.is_verified,
        isActive: p.is_active,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      },
    };
  },

  updateUser: async (id: string, data: Partial<User>) => {
    await supabase.from("profiles").update({
      full_name: data.fullName,
      phone: data.phone,
      clinic_name: data.clinicName,
      address: data.address,
      is_verified: data.isVerified,
      is_active: data.isActive,
      role: data.role,
    }).eq("id", id);
    return userApi.getUserById(id);
  },

  deleteUser: async (id: string) => {
    await supabase.from("profiles").delete().eq("id", id);
    return { success: true as const, message: "User deleted" };
  },
};

export const adminApi = {
  ...userApi,
  getDashboardData: async () => {
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { data: orders } = await supabase
      .from("orders")
      .select("*, profiles(full_name, email)")
      .order("created_at", { ascending: false });
    const { data: products } = await supabase.from("products").select("stock, low_stock_threshold");

    const totalUsers = (profiles || []).length;
    const totalOrders = (orders || []).length;
    const totalRevenue = (orders || [])
      .filter((o) => o.order_status !== "cancelled")
      .reduce((sum, o) => sum + Number(o.total_price || 0), 0);
    const lowStockCount = (products || []).filter(
      (p) => (p.stock || 0) <= (p.low_stock_threshold || 3)
    ).length;

    // Recent orders formatted for table
    const recentOrders = (orders || []).slice(0, 10).map((o: any) => ({
      id: o.id,
      orderId: o.order_number,
      customerName: o.profiles?.full_name || "Doctor",
      customerEmail: o.profiles?.email || "",
      total: Number(o.total_price),
      status: o.order_status,
      paymentStatus: o.payment_status,
      date: o.created_at,
    }));

    // Real Activity stream: merged recent orders & new clinic registrations
    const activityFeed: Array<{
      id: string;
      type: "order" | "user";
      message: string;
      time: string;
      user: { name: string; email: string };
    }> = [];

    (orders || []).slice(0, 5).forEach((o: any) => {
      activityFeed.push({
        id: `act-ord-${o.id}`,
        type: "order",
        message: `Placed order ${o.order_number} for ₹${Number(o.total_price).toLocaleString("en-IN")}`,
        time: o.created_at,
        user: {
          name: o.profiles?.full_name || "Doctor",
          email: o.profiles?.email || "",
        },
      });
    });

    (profiles || []).slice(0, 5).forEach((p: any) => {
      activityFeed.push({
        id: `act-usr-${p.id}`,
        type: "user",
        message: `New clinic registered ${p.clinic_name ? `(${p.clinic_name})` : ""}`,
        time: p.created_at,
        user: {
          name: p.full_name,
          email: p.email,
        },
      });
    });

    activityFeed.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    // Real Monthly Sales
    const monthlyTrendRes = await shopApi.getMonthlyTrend();
    const monthlySales = monthlyTrendRes.data.map((m) => ({
      day: m.month,
      revenue: m.sales,
    }));

    return {
      success: true as const,
      message: "OK",
      data: {
        stats: {
          totalUsers,
          totalOrders,
          totalRevenue,
          lowStockCount,
        },
        recentOrders,
        activityFeed: activityFeed.slice(0, 8),
        monthlySales,
      },
    };
  },
  getUsers: async () => {
    const res = await userApi.getAllUsers();
    return { success: true as const, message: "OK", data: res.data.users };
  },
  getOrders: shopApi.getOrders,
  updateOrderStatus: shopApi.updateOrderStatus,
  deleteUser: async (id: string) => {
    await userApi.deleteUser(id);
    return { success: true as const, message: "Deleted", data: { id } };
  },
  updateUserStatus: async (id: string, data: { isActive?: boolean; isVerified?: boolean }) => {
    await supabase.from("profiles").update({
      is_active: data.isActive,
      is_verified: data.isVerified,
    }).eq("id", id);
    const updated = await userApi.getUserById(id);
    return { success: true as const, message: "Status updated", data: updated.data };
  },
};

// ─── Image Storage API (Supabase Storage) ───────────────────────────────────

export const uploadApi = {
  uploadImage: async (file: File, _folder = "products"): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new ApiError(400, uploadError.message || "Failed to upload image");
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
    return data.publicUrl;
  },

  uploadMultiple: async (files: File[], folder = "products"): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const url = await uploadApi.uploadImage(file, folder);
      urls.push(url);
    }
    return urls;
  },
};