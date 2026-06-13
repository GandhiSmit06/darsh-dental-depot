import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard, Package, Warehouse, ShoppingBag, Users, BarChart3, Bell, Settings,
  DollarSign, TrendingUp, Plus, FileText,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { DashboardLayout, type NavItem } from "@/components/dashboard/DashboardLayout";
import { StatCard, StatusBadge, EmptyState } from "@/components/dashboard/widgets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  brands, categories, categoryShare, orders, products, salesMonthly, salesWeekly,
} from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/shop")({
  head: () => ({ meta: [{ title: "Shop Owner Dashboard — Darsh Dental Depot" }] }),
  component: ShopDashboard,
});

const items: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "products", label: "Products", icon: Package },
  { key: "inventory", label: "Inventory", icon: Warehouse },
  { key: "orders", label: "Orders", icon: ShoppingBag },
  { key: "customers", label: "Customers", icon: Users },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "settings", label: "Settings", icon: Settings },
];

const CHART_COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

function ShopDashboard() {
  const [active, setActive] = useState("dashboard");

  return (
    <DashboardLayout title="Shop Owner" role="Shop Owner" items={items} active={active} onChange={setActive}>
      {active === "dashboard" && <DashboardSection />}
      {active === "products" && <ProductsSection />}
      {active === "inventory" && <InventorySection />}
      {active === "orders" && <OrdersSection />}
      {active === "customers" && <CustomersSection />}
      {active === "analytics" && <AnalyticsSection />}
      {active === "notifications" && <NotificationsSection />}
      {active === "settings" && <SettingsSection />}
    </DashboardLayout>
  );
}

function DashboardSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground text-sm">Here's how your shop is performing today.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Sales" value="86,400" prefix="$" change={12.5} icon={DollarSign} />
        <StatCard label="Revenue" value="74,210" prefix="$" change={8.2} icon={TrendingUp} />
        <StatCard label="Orders" value="612" change={4.1} icon={ShoppingBag} />
        <StatCard label="Customers" value="1,284" change={-1.4} icon={Users} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold mb-4">Weekly sales</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesWeekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
                <Bar dataKey="sales" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Category share</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryShare} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                  {categoryShare.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold mb-4">Monthly sales trend</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesMonthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="sales" stroke="var(--color-chart-1)" strokeWidth={2} />
              <Line type="monotone" dataKey="orders" stroke="var(--color-chart-2)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function ProductForm({ onClose }: { onClose: () => void }) {
  return (
    <form className="grid grid-cols-2 gap-3" onSubmit={(e) => { e.preventDefault(); toast.success("Product saved"); onClose(); }}>
      <div className="col-span-2"><Label className="mb-1.5">Name</Label><Input required /></div>
      <div>
        <Label className="mb-1.5">Category</Label>
        <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label className="mb-1.5">Brand</Label>
        <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>{brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div><Label className="mb-1.5">Price</Label><Input type="number" required /></div>
      <div><Label className="mb-1.5">Stock</Label><Input type="number" required /></div>
      <div className="col-span-2"><Label className="mb-1.5">Description</Label><Textarea rows={3} /></div>
      <div className="col-span-2 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}

function ProductsSection() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Product</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Add product</DialogTitle></DialogHeader><ProductForm onClose={() => setOpen(false)} /></DialogContent>
        </Dialog>
      </div>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Brand</TableHead>
              <TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.slice(0, 10).map((p) => (
              <TableRow key={p.id}>
                <TableCell className="flex items-center gap-3 min-w-[220px]">
                  <img src={p.image} alt="" className="h-9 w-9 rounded object-cover" />
                  <span className="font-medium">{p.name}</span>
                </TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell>{p.brand}</TableCell>
                <TableCell>${p.price.toFixed(2)}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell><Button size="sm" variant="ghost" onClick={() => toast.message("Open edit form")}>Edit</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function InventorySection() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Inventory</h1>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead><TableHead>Product</TableHead>
              <TableHead>Stock</TableHead><TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.slice(0, 12).map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">{p.id.toUpperCase()}</TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>
                  <StatusBadge status={p.stock === 0 ? "Cancelled" : p.stock < 10 ? "Pending" : "Active"} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function OrdersSection() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Orders</h1>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Items</TableHead>
              <TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono">{o.id}</TableCell>
                <TableCell>{o.customer}</TableCell>
                <TableCell>{o.items}</TableCell>
                <TableCell>${o.total.toFixed(2)}</TableCell>
                <TableCell><StatusBadge status={o.status} /></TableCell>
                <TableCell className="text-muted-foreground">{o.date}</TableCell>
                <TableCell><Button size="sm" variant="outline" onClick={() => toast.success("Invoice downloaded")}><FileText className="h-3.5 w-3.5 mr-1" />Invoice</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function CustomersSection() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Customers</h1>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Orders</TableHead><TableHead>Spent</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{["Dr. A. Khan", "Dr. R. Mehta", "Dr. P. Sharma"][i % 3]}</TableCell>
                <TableCell className="text-muted-foreground">customer{i + 1}@dental.io</TableCell>
                <TableCell>{12 + i * 3}</TableCell>
                <TableCell>${(420 + i * 137).toFixed(2)}</TableCell>
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
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Product performance</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={products.slice(0, 6).map((p) => ({ name: p.name.split(" ")[0], sales: 100 + (p.reviewCount % 200) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
                <Bar dataKey="sales" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Revenue trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesMonthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
                <Line type="monotone" dataKey="sales" stroke="var(--color-chart-1)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function NotificationsSection() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <Card className="divide-y">
        {[
          { t: "New order ORD-1024 from Dr. Khan", d: "2 minutes ago" },
          { t: "Low stock alert: GC Fuji Glass Ionomer", d: "1 hour ago" },
          { t: "Monthly report is ready", d: "Yesterday" },
        ].map((n, i) => (
          <div key={i} className="p-4 flex items-start gap-3">
            <Bell className="h-4 w-4 text-primary mt-1" />
            <div className="flex-1">
              <div className="text-sm font-medium">{n.t}</div>
              <div className="text-xs text-muted-foreground">{n.d}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function SettingsSection() {
  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card className="p-6 space-y-4">
        <div><Label className="mb-1.5">Store name</Label><Input defaultValue="Darsh Dental Depot" /></div>
        <div><Label className="mb-1.5">Support email</Label><Input defaultValue="support@darshdental.com" /></div>
        <div className="flex items-center justify-between"><span className="text-sm">Email notifications</span><Switch defaultChecked /></div>
        <div className="flex items-center justify-between"><span className="text-sm">Low-stock alerts</span><Switch defaultChecked /></div>
        <Button onClick={() => toast.success("Settings saved")}>Save changes</Button>
      </Card>
    </div>
  );
}
