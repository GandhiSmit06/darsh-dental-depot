import { supabase } from "./supabase";
import { type AuthUser } from "./api";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  timestamp: number;
  type: "order" | "stock" | "user" | "payment" | "system";
  isRead: boolean;
  actionUrl?: string;
  actionTab?: string;
  metadata?: Record<string, any>;
}

const READ_NOTIFICATIONS_KEY = "ddd_notifications_read_v1";

function getReadNotificationIds(userId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(`${READ_NOTIFICATIONS_KEY}_${userId}`);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveReadNotificationIds(userId: string, ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${READ_NOTIFICATIONS_KEY}_${userId}`, JSON.stringify(Array.from(ids)));
  } catch (e) {
    console.error("Failed to save read notification IDs:", e);
  }
}

function formatRelativeTime(dateInput: string | Date | number): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 45) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export const notificationService = {
  /**
   * Fetches and generates all real-time dynamic notifications for the current user
   */
  getNotifications: async (user: AuthUser | null): Promise<AppNotification[]> => {
    if (!user) return [];

    const userId = user.id || user._id;
    const readIds = getReadNotificationIds(userId);
    const notifications: AppNotification[] = [];

    try {
      // ══════════════════════════════════════════════════════════════════════
      // 1. DOCTOR NOTIFICATIONS
      // ══════════════════════════════════════════════════════════════════════
      if (user.role === "doctor") {
        // A. Orders & Delivery Status Notifications
        const { data: userOrders } = await supabase
          .from("orders")
          .select("id, order_number, total_price, order_status, payment_status, created_at, updated_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10);

        (userOrders || []).forEach((order) => {
          const status = (order.order_status || "pending").toLowerCase();
          const orderNum = order.order_number;
          const orderTime = order.updated_at || order.created_at;
          const timeTs = new Date(orderTime).getTime();

          if (status === "delivered") {
            const id = `notif-doc-delivered-${order.id}`;
            notifications.push({
              id,
              title: "Order Delivered Successfully! ✅",
              message: `Order #${orderNum} has been delivered to your clinic. Thank you for choosing Darsh Dental Depot!`,
              time: formatRelativeTime(orderTime),
              timestamp: timeTs,
              type: "order",
              isRead: readIds.has(id),
              actionTab: "orders",
            });
          } else if (status === "out_for_delivery" || status === "shipped") {
            const id = `notif-doc-shipped-${order.id}`;
            notifications.push({
              id,
              title: "Out for Delivery! 🚚",
              message: `Order #${orderNum} is on the way for same-day Vadodara clinic dispatch.`,
              time: formatRelativeTime(orderTime),
              timestamp: timeTs,
              type: "order",
              isRead: readIds.has(id),
              actionTab: "orders",
            });
          } else if (status === "confirmed" || status === "processing") {
            const id = `notif-doc-confirmed-${order.id}`;
            notifications.push({
              id,
              title: "Order Confirmed & Packing 📦",
              message: `Order #${orderNum} (₹${Number(order.total_price).toLocaleString("en-IN")}) is verified and being packed.`,
              time: formatRelativeTime(orderTime),
              timestamp: timeTs,
              type: "order",
              isRead: readIds.has(id),
              actionTab: "orders",
            });
          } else if (status === "cancelled") {
            const id = `notif-doc-cancelled-${order.id}`;
            notifications.push({
              id,
              title: "Order Cancelled ❌",
              message: `Order #${orderNum} has been cancelled.`,
              time: formatRelativeTime(orderTime),
              timestamp: timeTs,
              type: "order",
              isRead: readIds.has(id),
              actionTab: "orders",
            });
          } else {
            // Pending placement
            const id = `notif-doc-placed-${order.id}`;
            notifications.push({
              id,
              title: "Order Placed Successfully ✨",
              message: `We received Order #${orderNum} for ₹${Number(order.total_price).toLocaleString("en-IN")}.`,
              time: formatRelativeTime(orderTime),
              timestamp: timeTs,
              type: "order",
              isRead: readIds.has(id),
              actionTab: "orders",
            });
          }
        });

        // B. Wishlist Back-in-Stock Alerts
        // Read local wishlist items
        let wishlistItems: Array<{ productId: string; name: string }> = [];
        try {
          const raw = localStorage.getItem("ddd_wishlist_items");
          if (raw) wishlistItems = JSON.parse(raw);
        } catch {
          wishlistItems = [];
        }

        if (wishlistItems.length > 0) {
          const productIds = wishlistItems.map((w) => w.productId).filter(Boolean);
          if (productIds.length > 0) {
            const { data: matchedProducts } = await supabase
              .from("products")
              .select("id, name, stock, selling_price, updated_at")
              .in("id", productIds);

            (matchedProducts || []).forEach((prod) => {
              // If wishlisted product has healthy stock (> 0)
              if (prod.stock && prod.stock > 0) {
                const id = `notif-wishlist-restock-${prod.id}`;
                notifications.push({
                  id,
                  title: "Wishlist Item Back in Stock! 🎉",
                  message: `"${prod.name}" from your wishlist is now refilled (${prod.stock} units available at ₹${prod.selling_price}).`,
                  time: formatRelativeTime(prod.updated_at || new Date()),
                  timestamp: new Date(prod.updated_at || Date.now()).getTime(),
                  type: "stock",
                  isRead: readIds.has(id),
                  actionTab: "wishlist",
                });
              }
            });
          }
        }
      }

      // ══════════════════════════════════════════════════════════════════════
      // 2. SHOP OWNER NOTIFICATIONS
      // ══════════════════════════════════════════════════════════════════════
      if (user.role === "shop_owner") {
        // A. Incoming Orders from Clinics
        const { data: shopOrders } = await supabase
          .from("orders")
          .select("id, order_number, total_price, order_status, created_at, profiles(full_name, clinic_name)")
          .order("created_at", { ascending: false })
          .limit(10);

        (shopOrders || []).forEach((o: any) => {
          const docName = o.profiles?.full_name || "Doctor";
          const clinic = o.profiles?.clinic_name ? ` (${o.profiles.clinic_name})` : "";
          const id = `notif-shop-order-${o.id}`;

          notifications.push({
            id,
            title: `New Order Received! 🛒`,
            message: `Order #${o.order_number} placed by ${docName}${clinic} for ₹${Number(o.total_price).toLocaleString("en-IN")}.`,
            time: formatRelativeTime(o.created_at),
            timestamp: new Date(o.created_at).getTime(),
            type: "order",
            isRead: readIds.has(id),
            actionTab: "orders",
          });
        });

        // B. Low Stock & Out of Stock Alerts
        const { data: stockProducts } = await supabase
          .from("products")
          .select("id, name, stock, low_stock_threshold, updated_at")
          .order("stock", { ascending: true })
          .limit(10);

        (stockProducts || []).forEach((p) => {
          const threshold = p.low_stock_threshold || 3;
          if (p.stock <= 0) {
            const id = `notif-shop-outofstock-${p.id}`;
            notifications.push({
              id,
              title: "Product Out of Stock! ⚠️",
              message: `"${p.name}" has 0 stock remaining. Clinics cannot order until refilled.`,
              time: formatRelativeTime(p.updated_at || new Date()),
              timestamp: new Date(p.updated_at || Date.now()).getTime(),
              type: "stock",
              isRead: readIds.has(id),
              actionTab: "inventory",
            });
          } else if (p.stock <= threshold) {
            const id = `notif-shop-lowstock-${p.id}`;
            notifications.push({
              id,
              title: "Low Stock Warning 📦",
              message: `"${p.name}" is running low (${p.stock} units left, threshold is ${threshold}).`,
              time: formatRelativeTime(p.updated_at || new Date()),
              timestamp: new Date(p.updated_at || Date.now()).getTime(),
              type: "stock",
              isRead: readIds.has(id),
              actionTab: "inventory",
            });
          }
        });

        // C. New Doctor Registrations
        const { data: newDoctors } = await supabase
          .from("profiles")
          .select("id, full_name, clinic_name, created_at")
          .eq("role", "doctor")
          .order("created_at", { ascending: false })
          .limit(5);

        (newDoctors || []).forEach((doc) => {
          const id = `notif-shop-newdoc-${doc.id}`;
          notifications.push({
            id,
            title: "New Clinic Registered 🏥",
            message: `${doc.full_name || "Doctor"} registered clinic "${doc.clinic_name || "Dental Practice"}".`,
            time: formatRelativeTime(doc.created_at),
            timestamp: new Date(doc.created_at).getTime(),
            type: "user",
            isRead: readIds.has(id),
            actionTab: "customers",
          });
        });
      }

      // ══════════════════════════════════════════════════════════════════════
      // 3. ADMIN NOTIFICATIONS
      // ══════════════════════════════════════════════════════════════════════
      if (user.role === "admin") {
        // A. Platform registrations
        const { data: allUsers } = await supabase
          .from("profiles")
          .select("id, full_name, email, role, clinic_name, created_at")
          .order("created_at", { ascending: false })
          .limit(8);

        (allUsers || []).forEach((u) => {
          const id = `notif-admin-user-${u.id}`;
          notifications.push({
            id,
            title: `New User Sign-up (${u.role}) 👤`,
            message: `${u.full_name || "User"} (${u.email}) joined the platform.`,
            time: formatRelativeTime(u.created_at),
            timestamp: new Date(u.created_at).getTime(),
            type: "user",
            isRead: readIds.has(id),
            actionTab: "users",
          });
        });

        // B. Platform Orders
        const { data: adminOrders } = await supabase
          .from("orders")
          .select("id, order_number, total_price, order_status, created_at, profiles(full_name)")
          .order("created_at", { ascending: false })
          .limit(8);

        (adminOrders || []).forEach((o: any) => {
          const id = `notif-admin-order-${o.id}`;
          notifications.push({
            id,
            title: `Platform Order #${o.order_number} 💰`,
            message: `Order worth ₹${Number(o.total_price).toLocaleString("en-IN")} placed by ${o.profiles?.full_name || "Doctor"}.`,
            time: formatRelativeTime(o.created_at),
            timestamp: new Date(o.created_at).getTime(),
            type: "order",
            isRead: readIds.has(id),
            actionTab: "orders",
          });
        });

        // C. Catalog Low Stock Summary
        const { data: lowStockProds } = await supabase
          .from("products")
          .select("id, name, stock")
          .lte("stock", 3)
          .limit(5);

        (lowStockProds || []).forEach((p) => {
          const id = `notif-admin-stock-${p.id}`;
          notifications.push({
            id,
            title: `Inventory Alert: ${p.name} 📦`,
            message: `Only ${p.stock} units remaining in shop inventory.`,
            time: "Active alert",
            timestamp: Date.now() - 3600000,
            type: "stock",
            isRead: readIds.has(id),
            actionTab: "products",
          });
        });
      }

      // Sort all notifications chronologically (newest first)
      notifications.sort((a, b) => b.timestamp - a.timestamp);

      return notifications;
    } catch (err) {
      console.error("Error generating dynamic notifications:", err);
      return [];
    }
  },

  /**
   * Marks a single notification as read
   */
  markAsRead: (userId: string, notificationId: string) => {
    const ids = getReadNotificationIds(userId);
    ids.add(notificationId);
    saveReadNotificationIds(userId, ids);
  },

  /**
   * Marks all provided notification IDs as read
   */
  markAllAsRead: (userId: string, notifications: AppNotification[]) => {
    const ids = getReadNotificationIds(userId);
    notifications.forEach((n) => ids.add(n.id));
    saveReadNotificationIds(userId, ids);
  },

  /**
   * Clears read notification cache for a user
   */
  clearAll: (userId: string) => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(`${READ_NOTIFICATIONS_KEY}_${userId}`);
  },
};
