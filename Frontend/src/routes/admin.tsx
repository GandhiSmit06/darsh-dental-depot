import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, Package, ShoppingBag, BarChart3, FileText, Settings,
  DollarSign, TrendingUp, Activity, Download, Trash2, Loader2, Bell, CheckCircle2,
  RefreshCw, Clock, Check, ChevronRight, UserCheck, CreditCard, Banknote, Building, Phone, XCircle
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { DashboardLayout, type NavItem } from "@/components/dashboard/DashboardLayout";
import { StatCard, StatusBadge } from "@/components/dashboard/widgets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { adminApi, shopApi, type User, type ShopOrder } from "@/lib/api";
import { notificationService, type AppNotification } from "@/lib/notifications";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Darsh Dental Depot" }] }),
  component: AdminDashboard,
});

const items: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "users", label: "Users", icon: Users },
  { key: "products", label: "Products", icon: Package },
  { key: "orders", label: "Orders", icon: ShoppingBag },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "reports", label: "Reports", icon: FileText },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "settings", label: "Settings", icon: Settings },
];

// Types for dashboard data
interface ActivityItem {
  id: string;
  type: 'order' | 'user';
  message: string;
  time: string;
  user: {
    name: string;
    email: string;
  };
}

interface RecentOrder {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  paymentStatus: string;
  date: string;
}

interface MonthlySale {
  day: string;
  revenue: number;
}

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockCount: number;
}

interface DashboardData {
  activityFeed: ActivityItem[];
  recentOrders: RecentOrder[];
  monthlySales: MonthlySale[];
  stats: DashboardStats;
}

function AdminDashboard() {
  const [active, setActive] = useState("dashboard");
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Dashboard data
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!isAuthenticated) return;

    setDashboardLoading(true);
    setDashboardError(null);

    try {
      const response = await adminApi.getDashboardData();
      setDashboardData(response.data);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setDashboardError(err?.message || "Failed to load dashboard data");
    } finally {
      setDashboardLoading(false);
    }
  };

  // Fetch data when auth status changes or component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  // Handle logout
  const handleLogout = () => {
    // TODO: Implement logout
    toast.success("Logged out successfully");
  };

  function Overview() {
    if (authLoading) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <div>Please log in to access the admin dashboard</div>;
    }

    if (dashboardLoading && !dashboardData) {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Platform overview</h1>
            <p className="text-muted-foreground text-sm">Real-time health of the platform.</p>
          </div>
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      );
    }

    if (dashboardError) {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Platform overview</h1>
            <p className="text-muted-foreground text-sm">Real-time health of the platform.</p>
          </div>
          <div className="p-4 bg-destructive/10 rounded-border text-destructive">
            {dashboardError}
            <button className="mt-2 btn btn-outline btn-primary" onClick={fetchDashboardData}>
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!dashboardData) {
      return <div>Loading dashboard data...</div>;
    }

    const { activityFeed, recentOrders, monthlySales, stats } = dashboardData;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Platform overview</h1>
          <p className="text-muted-foreground text-sm">Real-time health of the platform.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Revenue" value={stats.totalRevenue.toLocaleString()} prefix="₹" change={9.4} icon={DollarSign} />
          <StatCard label="Active Users" value={stats.totalUsers.toLocaleString()} change={3.1} icon={Users} />
          <StatCard label="Orders Today" value={stats.totalOrders.toLocaleString()} change={11.7} icon={ShoppingBag} />
          <StatCard label="Growth" value="18.2%" change={2.4} icon={TrendingUp} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5 lg:col-span-2">
            <h3 className="font-semibold mb-4">Revenue trend</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySales.map((item, index) => ({
                  month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][new Date().getMonth()],
                  sales: item.revenue,
                }))}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
                  <Area type="monotone" dataKey="sales" stroke="var(--color-primary)" fill="url(#rev)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="font-semibold mb-4">Activity log</h3>
            <div className="space-y-3 max-h-72 overflow-auto">
              {activityFeed.map((activity) => (
                <div key={activity.id} className="flex gap-3 text-sm">
                  {activity.type === 'order' ? (
                    <ShoppingBag className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  ) : (
                    <Users className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="truncate"><span className="font-medium">{activity.user.name}</span> · {activity.message}</div>
                    <div className="text-xs text-muted-foreground">{new Date(activity.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="mt-6">
          <h3 className="font-semibold mb-4">Recent orders</h3>
          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.orderId}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>₹{order.total.toFixed(2)}</TableCell>
                      <TableCell><StatusBadge status={order.status as any} /></TableCell>
                      <TableCell><StatusBadge status={order.paymentStatus as any} /></TableCell>
                      <TableCell className="text-muted-foreground">{new Date(order.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No recent orders</p>
          )}
        </div>
      </div>
    );
  }

  function UsersSection() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadUsers = async () => {
      setLoading(true);
      try {
        const res = await adminApi.getUsers();
        setUsers(res.data || []);
      } catch (err: any) {
        toast.error(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadUsers();
    }, []);

    const handleDeleteUser = async (userId: string, userName: string) => {
      if (!confirm(`Are you sure you want to permanently delete user "${userName}"? This cannot be undone.`)) {
        return;
      }
      setDeletingId(userId);
      try {
        await adminApi.deleteUser(userId);
        toast.success(`User "${userName}" deleted successfully`);
        setUsers((prev) => prev.filter((u) => u._id !== userId));
      } catch (err: any) {
        toast.error(err.message || "Failed to delete user");
      } finally {
        setDeletingId(null);
      }
    };

    const handleToggleStatus = async (userId: string, currentActive: boolean) => {
      try {
        const newStatus = !currentActive;
        await adminApi.updateUserStatus(userId, { isActive: newStatus });
        toast.success(`User marked as ${newStatus ? "Active" : "Suspended"}`);
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isActive: newStatus } : u))
        );
      } catch (err: any) {
        toast.error(err.message || "Failed to update user status");
      }
    };

    const filteredUsers = users.filter((u) => {
      const matchSearch =
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.clinicName && u.clinicName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      return matchSearch && matchRole;
    });

    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-sm text-muted-foreground">Manage doctors, clinic accounts, and platform roles.</p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by name, email, clinic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 text-sm"
            />
            <Button variant="outline" size="sm" onClick={loadUsers} disabled={loading}>
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {["all", "doctor", "shop_owner", "admin"].map((r) => (
            <Button
              key={r}
              size="sm"
              variant={roleFilter === r ? "default" : "outline"}
              onClick={() => setRoleFilter(r)}
              className="capitalize text-xs rounded-xl"
            >
              {r === "all" ? "All Users" : r === "shop_owner" ? "Shop Owner" : r}
            </Button>
          ))}
        </div>

        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User / Clinic</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading user accounts...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No users found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell>
                      <div className="font-semibold text-foreground">{u.fullName}</div>
                      {u.clinicName && (
                        <div className="text-xs text-muted-foreground">{u.clinicName}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{u.email}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{u.phone || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize text-xs font-semibold ${
                          u.role === "admin"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                            : u.role === "shop_owner"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        {u.role.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          u.isActive
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {u.isActive ? "Active" : "Suspended"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-8 px-2"
                          onClick={() => handleToggleStatus(u._id, u.isActive)}
                        >
                          {u.isActive ? "Suspend" : "Activate"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                          disabled={deletingId === u._id || u.role === "admin"}
                          onClick={() => handleDeleteUser(u._id, u.fullName)}
                          title={u.role === "admin" ? "Admin accounts cannot be deleted" : "Delete user"}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    );
  }

  function ProductsSection() {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">All products</h1>
        <Card className="p-6 text-sm text-muted-foreground">Manage the global catalog across all shops. Use the Shop dashboard for per-store product editing.</Card>
      </div>
    );
  }

  function OrdersSection() {
    const [orders, setOrders] = useState<ShopOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [paymentFilter, setPaymentFilter] = useState<"all" | "razorpay" | "cod" | "paid" | "pending">("all");
    const [search, setSearch] = useState("");

    const loadOrders = async () => {
      try {
        const res = await adminApi.getOrders();
        setOrders(res.data || []);
      } catch (err: any) {
        toast.error(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadOrders();
      const interval = setInterval(loadOrders, 5000);
      return () => clearInterval(interval);
    }, []);

    const handleStatusChange = async (orderId: string, orderNumber: string, newStatus: string) => {
      setUpdatingId(orderId);
      try {
        await adminApi.updateOrderStatus(orderId, newStatus);
        toast.success(`Order ${orderNumber} is now "${newStatus.toUpperCase()}"!`);
        loadOrders();
      } catch (err: unknown) {
        toast.error((err as Error).message || "Failed to update order status");
      } finally {
        setUpdatingId(null);
      }
    };

    // Metrics
    const totalOrdersCount = orders.length;
    const razorpayOrders = orders.filter((o) => o.paymentMethod?.toLowerCase() === "razorpay");
    const codOrders = orders.filter((o) => o.paymentMethod?.toLowerCase() === "cod");
    const paidOrders = orders.filter((o) => o.paymentStatus?.toLowerCase() === "paid");
    const pendingPaymentOrders = orders.filter((o) => o.paymentStatus?.toLowerCase() === "pending");

    const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== "cancelled" ? o.total : 0), 0);
    const razorpayPaidRevenue = razorpayOrders
      .filter((o) => o.paymentStatus?.toLowerCase() === "paid")
      .reduce((sum, o) => sum + o.total, 0);
    const codRevenue = codOrders.reduce((sum, o) => sum + o.total, 0);

    const filteredOrders = orders.filter((o) => {
      if (paymentFilter === "razorpay" && o.paymentMethod?.toLowerCase() !== "razorpay") return false;
      if (paymentFilter === "cod" && o.paymentMethod?.toLowerCase() !== "cod") return false;
      if (paymentFilter === "paid" && o.paymentStatus?.toLowerCase() !== "paid") return false;
      if (paymentFilter === "pending" && o.paymentStatus?.toLowerCase() !== "pending") return false;

      if (!search) return true;
      const s = search.toLowerCase();
      return (
        o.orderId.toLowerCase().includes(s) ||
        o.customerName.toLowerCase().includes(s) ||
        o.customerEmail.toLowerCase().includes(s) ||
        (o.clinicName && o.clinicName.toLowerCase().includes(s)) ||
        (o.paymentId && o.paymentId.toLowerCase().includes(s))
      );
    });

    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold font-heading">Platform Orders & Payments</h1>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Master payment logs • All Vadodara clinic transactions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by order, doctor, clinic, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-64 text-xs rounded-xl"
            />
            <Button variant="outline" size="sm" onClick={loadOrders} className="text-xs rounded-xl gap-1.5 h-9">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
          </div>
        </div>

        {/* Master Payment KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 rounded-2xl border bg-card shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span>Total Orders Placed</span>
              <ShoppingBag className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-extrabold font-heading text-foreground">{totalOrdersCount}</div>
            <div className="text-[11px] text-muted-foreground">
              Platform Gross: <span className="font-bold text-foreground">₹{totalRevenue.toLocaleString("en-IN")}</span>
            </div>
          </Card>

          <Card className="p-4 rounded-2xl border border-sky-500/20 bg-sky-500/5 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-xs text-sky-700 dark:text-sky-400 font-semibold">
              <span>Razorpay Online Collections</span>
              <CreditCard className="h-4 w-4 text-sky-600" />
            </div>
            <div className="text-2xl font-extrabold font-heading text-sky-800 dark:text-sky-300">
              ₹{razorpayPaidRevenue.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-sky-700/80 dark:text-sky-400">
              <span className="font-bold">{paidOrders.length}</span> verified online transaction{paidOrders.length !== 1 ? "s" : ""}
            </div>
          </Card>

          <Card className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
              <span>Pay on Delivery (COD)</span>
              <Banknote className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold font-heading text-emerald-800 dark:text-emerald-300">
              ₹{codRevenue.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400">
              <span className="font-bold">{codOrders.length}</span> clinic package{codOrders.length !== 1 ? "s" : ""}
            </div>
          </Card>

          <Card className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-semibold">
              <span>Pending Settlements</span>
              <span className="h-2 w-2 rounded-full bg-amber-500" />
            </div>
            <div className="text-2xl font-extrabold font-heading text-amber-800 dark:text-amber-300">
              {pendingPaymentOrders.length}
            </div>
            <div className="text-[11px] text-amber-700/80 dark:text-amber-400">
              Awaiting clinic delivery or retry
            </div>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { key: "all", label: `All Orders (${orders.length})` },
            { key: "razorpay", label: `⚡ Razorpay Online (${razorpayOrders.length})` },
            { key: "cod", label: `💵 Pay on Delivery (${codOrders.length})` },
            { key: "paid", label: `✅ Paid (${paidOrders.length})` },
            { key: "pending", label: `⏳ Pending (${pendingPaymentOrders.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPaymentFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                paymentFilter === tab.key
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !filteredOrders.length ? (
          <Card className="p-8 text-center text-muted-foreground rounded-2xl">
            No orders found matching this view.
          </Card>
        ) : (
          <Card className="overflow-hidden rounded-2xl border shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-bold">Order #</TableHead>
                  <TableHead className="font-bold">Doctor & Clinic</TableHead>
                  <TableHead className="font-bold">Items</TableHead>
                  <TableHead className="font-bold">Total Amount</TableHead>
                  <TableHead className="font-bold">Payment Details & ID</TableHead>
                  <TableHead className="font-bold">Order Status</TableHead>
                  <TableHead className="font-bold">Date & Time</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((o) => (
                  <TableRow key={o._id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono font-bold text-xs text-primary">
                      {o.orderId}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-sm text-foreground">
                        {o.customerName}
                      </div>
                      {o.clinicName && (
                        <div className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                          <Building className="h-3 w-3 text-primary/70 shrink-0" />
                          {o.clinicName}
                        </div>
                      )}
                      {o.contactPhone && (
                        <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                          {o.contactPhone}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold bg-muted px-2 py-0.5 rounded-md">
                        {o.itemCount} item{o.itemCount > 1 ? "s" : ""}
                      </span>
                    </TableCell>
                    <TableCell className="font-extrabold text-sm text-foreground">
                      ₹{o.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {o.paymentMethod?.toLowerCase() === "razorpay" ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
                            <CreditCard className="h-3 w-3 text-sky-600" /> Razorpay Online
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            <Banknote className="h-3 w-3 text-emerald-600" /> Pay on Delivery (COD)
                          </div>
                        )}
                        <div>
                          {o.paymentStatus?.toLowerCase() === "paid" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" /> Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              🟡 Payment Pending
                            </span>
                          )}
                        </div>
                        {o.paymentId && (
                          <div className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded w-fit">
                            ID: {o.paymentId}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={o.status as any} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {o.date}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs px-2.5 rounded-xl gap-1"
                        onClick={() => {
                          shopApi
                            .getOrderInvoice(o._id)
                            .then(() => toast.success(`Invoice for ${o.orderId} generated`))
                            .catch(() => toast.error("Failed to generate invoice"));
                        }}
                      >
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        Invoice
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    );
  }

  function AnalyticsSection() {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Orders by month</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[]}> {/* TODO: Replace with real data */}
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="orders" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="sales" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    );
  }

  function ReportsSection() {
    const reports = [
      { name: "Sales Q3 2025", date: "Oct 1, 2025", size: "1.2 MB" },
      { name: "Inventory Audit", date: "Sep 14, 2025", size: "640 KB" },
      { name: "User Growth Report", date: "Aug 30, 2025", size: "2.1 MB" },
      { name: "Compliance Report", date: "Aug 1, 2025", size: "880 KB" },
    ];
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="grid sm:grid-cols-2 gap-4">
          {reports.map((r) => (
            <Card key={r.name} className="p-5 flex items-center gap-4">
              <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{r.name}</div>
                <div className="text-xs text-muted-foreground">{r.date} · {r.size}</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.success("Downloading")}>
                <Download className="h-3.5 w-3.5 mr-1" /> Download
              </Button>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  function SettingsSection() {
    return (
      <div className="space-y-5 max-w-2xl">
        <h1 className="text-2xl font-bold">Platform settings</h1>
        <Card className="p-6 space-y-4">
          <div><Label className="mb-1.5">Platform name</Label><Input defaultValue="Darsh Dental Depot" /></div>
          <div><Label className="mb-1.5">Admin email</Label><Input defaultValue="admin@darshdental.com" /></div>
          <div className="flex items-center justify-between"><span className="text-sm">Maintenance mode</span><Switch /></div>
          <div className="flex items-center justify-between"><span className="text-sm">Allow new registrations</span><Switch defaultChecked /></div>
          <Button onClick={() => toast.success("Settings saved")}>Save</Button>
        </Card>
      </div>
    );
  }

  function NotificationsSection() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const data = await notificationService.getNotifications(user);
        setNotifications(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      load();
    }, [user]);

    const handleMarkAllRead = () => {
      if (!user) return;
      notificationService.markAllAsRead(user.id || user._id, notifications);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    };

    const handleItemClick = (n: AppNotification) => {
      if (user) {
        notificationService.markAsRead(user.id || user._id, n.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
        );
      }
      if (n.actionTab) {
        setActive(n.actionTab);
      }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-heading">System & Platform Alerts</h1>
              {unreadCount > 0 && (
                <Badge className="bg-primary text-white font-bold text-xs px-2.5 py-0.5 rounded-full">
                  {unreadCount} New
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live audit events, doctor registrations, and new orders across the platform.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="text-xs rounded-xl h-9">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Mark all as read
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={load} className="text-xs rounded-xl h-9">
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center space-y-3 rounded-3xl border-dashed">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary mx-auto grid place-items-center">
              <Bell className="h-7 w-7 opacity-70" />
            </div>
            <h3 className="font-bold text-lg">No Platform Alerts</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              All platform systems are operational. New registrations, platform orders, and critical stock events will show here.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <Card
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md hover:border-primary/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !n.isRead
                    ? "bg-primary/5 border-primary/30 shadow-xs"
                    : "bg-card border-border/70 opacity-90"
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`h-11 w-11 rounded-2xl grid place-items-center shrink-0 ${
                      n.type === "order"
                        ? "bg-primary/15 text-primary"
                        : n.type === "stock"
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {n.type === "order" ? (
                      <ShoppingBag className="h-5 w-5" />
                    ) : n.type === "stock" ? (
                      <Package className="h-5 w-5" />
                    ) : (
                      <Users className="h-5 w-5" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-foreground">{n.title}</span>
                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      )}
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        {n.time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                  {n.actionTab && (
                    <Button variant="secondary" size="sm" className="rounded-xl text-xs h-8 px-3 font-semibold">
                      View
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Admin Control Hub"
      role="Admin"
      items={items}
      active={active}
      onChange={setActive}
    >
      {active === "dashboard" && <Overview />}
      {active === "users" && <UsersSection />}
      {active === "products" && <ProductsSection />}
      {active === "orders" && <OrdersSection />}
      {active === "analytics" && <AnalyticsSection />}
      {active === "reports" && <ReportsSection />}
      {active === "notifications" && <NotificationsSection />}
      {active === "settings" && <SettingsSection />}
    </DashboardLayout>
  );
}

// Helper component for loading state in tables
function TableLoader({ colspan }: { colspan: number }) {
  return (
    <TableRow>
      <TableCell colSpan={colspan} className="text-center py-8">
        <div className="flex items-center justify-center gap-3">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
          <span className="text-muted-foreground">Loading data...</span>
        </div>
      </TableCell>
    </TableRow>
  );
}