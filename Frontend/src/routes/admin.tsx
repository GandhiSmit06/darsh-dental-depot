import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, Package, ShoppingBag, BarChart3, FileText, Settings,
  DollarSign, TrendingUp, Activity, Download,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { adminApi } from "@/lib/api";

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
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Users</h1>
          <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
        </div>
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Email</TableHead>
                <TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Joined</TableHead><TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* TODO: Fetch real user data from API */}
              {/* Placeholder - replace with actual API call */}
              <TableRow key="loading">
                <TableLoader colspan="7" />
              </TableRow>
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
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">All orders</h1>
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {/* TODO: Fetch real order data from API */}
              {/* Placeholder - replace with actual API call */}
              <TableRow key="loading">
                <TableLoader colspan="6" />
              </TableRow>
            </TableBody>
          </Table>
        </Card>
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