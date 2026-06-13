import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import { activityLogs, orders, salesMonthly, users } from "@/lib/mock-data";
import { toast } from "sonner";

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

function AdminDashboard() {
  const [active, setActive] = useState("dashboard");
  return (
    <DashboardLayout title="Admin" role="Admin" items={items} active={active} onChange={setActive}>
      {active === "dashboard" && <Overview />}
      {active === "users" && <UsersSection />}
      {active === "products" && <ProductsSection />}
      {active === "orders" && <OrdersSection />}
      {active === "analytics" && <AnalyticsSection />}
      {active === "reports" && <ReportsSection />}
      {active === "settings" && <SettingsSection />}
    </DashboardLayout>
  );
}

function Overview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform overview</h1>
        <p className="text-muted-foreground text-sm">Real-time health of the platform.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value="412,000" prefix="$" change={9.4} icon={DollarSign} />
        <StatCard label="Active Users" value="3,847" change={3.1} icon={Users} />
        <StatCard label="Orders Today" value="142" change={11.7} icon={ShoppingBag} />
        <StatCard label="Growth" value="18.2%" change={2.4} icon={TrendingUp} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold mb-4">Revenue trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesMonthly}>
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
            {activityLogs.map((l) => (
              <div key={l.id} className="flex gap-3 text-sm">
                <Activity className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="truncate"><span className="font-medium">{l.actor}</span> · {l.action}</div>
                  <div className="text-xs text-muted-foreground">{l.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
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
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-mono text-xs">{u.id}</TableCell>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell><StatusBadge status={u.status} /></TableCell>
                <TableCell className="text-muted-foreground">{u.joined}</TableCell>
                <TableCell><Button variant="ghost" size="sm" onClick={() => toast.success("Updated")}>Manage</Button></TableCell>
              </TableRow>
            ))}
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
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono">{o.id}</TableCell>
                <TableCell>{o.customer}</TableCell>
                <TableCell>${o.total.toFixed(2)}</TableCell>
                <TableCell><StatusBadge status={o.status} /></TableCell>
                <TableCell className="text-muted-foreground">{o.date}</TableCell>
              </TableRow>
            ))}
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
            <BarChart data={salesMonthly}>
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
