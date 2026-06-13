import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard, ShoppingCart, Heart, ShoppingBag, Bell, Settings, Package,
  CheckCircle2, Truck, Clock, Plus, Minus, Trash2,
} from "lucide-react";
import { DashboardLayout, type NavItem } from "@/components/dashboard/DashboardLayout";
import { StatCard, StatusBadge, EmptyState } from "@/components/dashboard/widgets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductCard } from "@/components/site/ProductCard";
import { products, orders } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/doctor")({
  head: () => ({ meta: [{ title: "Doctor Dashboard — Darsh Dental Depot" }] }),
  component: DoctorDashboard,
});

const items: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "browse", label: "Browse Products", icon: Package },
  { key: "cart", label: "Cart", icon: ShoppingCart },
  { key: "wishlist", label: "Wishlist", icon: Heart },
  { key: "orders", label: "Orders", icon: ShoppingBag },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "settings", label: "Settings", icon: Settings },
];

function DoctorDashboard() {
  const [active, setActive] = useState("dashboard");
  return (
    <DashboardLayout title="Doctor" role="Doctor" items={items} active={active} onChange={setActive}>
      {active === "dashboard" && <Overview />}
      {active === "browse" && <Browse />}
      {active === "cart" && <CartSection />}
      {active === "wishlist" && <Wishlist />}
      {active === "orders" && <OrdersSection />}
      {active === "notifications" && <NotificationsSection />}
      {active === "settings" && <SettingsSection />}
    </DashboardLayout>
  );
}

function Overview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, Dr. Khan</h1>
        <p className="text-muted-foreground text-sm">Your practice at a glance.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Orders" value="3" icon={ShoppingBag} change={0} />
        <StatCard label="Wishlist Items" value="12" icon={Heart} />
        <StatCard label="Total Spent" value="4,210" prefix="$" icon={Package} change={6.2} />
        <StatCard label="Cart Items" value="5" icon={ShoppingCart} />
      </div>
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Recommended for you</h3>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </Card>
    </div>
  );
}

function Browse() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Browse products</h1>
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.slice(0, 12).map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}

function CartSection() {
  const [cart, setCart] = useState(
    products.slice(0, 4).map((p) => ({ ...p, qty: 1 }))
  );
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Your cart</h1>
      {cart.length === 0 ? (
        <EmptyState title="Cart is empty" description="Browse products to add items." />
      ) : (
        <div className="grid lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2 divide-y">
            {cart.map((item) => (
              <div key={item.id} className="p-4 flex items-center gap-4">
                <img src={item.image} alt="" className="h-16 w-16 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.brand}</div>
                </div>
                <div className="flex items-center border rounded-md">
                  <button className="px-2 py-1" onClick={() => setCart(c => c.map(x => x.id === item.id ? { ...x, qty: Math.max(1, x.qty - 1) } : x))}><Minus className="h-3 w-3" /></button>
                  <span className="w-8 text-center text-sm">{item.qty}</span>
                  <button className="px-2 py-1" onClick={() => setCart(c => c.map(x => x.id === item.id ? { ...x, qty: x.qty + 1 } : x))}><Plus className="h-3 w-3" /></button>
                </div>
                <div className="w-20 text-right font-semibold">${(item.price * item.qty).toFixed(2)}</div>
                <Button variant="ghost" size="icon" onClick={() => setCart(c => c.filter(x => x.id !== item.id))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </Card>
          <Card className="p-5 h-fit">
            <h3 className="font-semibold mb-3">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>Free</span></div>
              <div className="flex justify-between font-bold border-t pt-3 mt-3"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
            <Button className="w-full mt-4" onClick={() => toast.success("Checkout started")}>Checkout</Button>
          </Card>
        </div>
      )}
    </div>
  );
}

function Wishlist() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Wishlist</h1>
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        {products.slice(4, 8).map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}

function OrdersSection() {
  const stages = [
    { label: "Ordered", icon: CheckCircle2, done: true },
    { label: "Processing", icon: Package, done: true },
    { label: "Shipped", icon: Truck, done: true },
    { label: "Delivered", icon: CheckCircle2, done: false },
  ];
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Order history</h1>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-sm text-muted-foreground">Order #ORD-1024</div>
            <div className="font-semibold">3 items · $324.50</div>
          </div>
          <Badge>In transit</Badge>
        </div>
        <div className="relative flex items-center justify-between">
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-border" />
          <div className="absolute top-4 left-4 h-0.5 bg-primary" style={{ width: "calc(66% - 1rem)" }} />
          {stages.map((s) => (
            <div key={s.label} className="relative flex flex-col items-center gap-2 z-10">
              <div className={`h-9 w-9 rounded-full grid place-items-center border-2 ${s.done ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground"}`}>
                <s.icon className="h-4 w-4" />
              </div>
              <span className="text-xs">{s.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Order</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {orders.slice(0, 8).map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono">{o.id}</TableCell>
                <TableCell>{o.items}</TableCell>
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

function NotificationsSection() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <Card className="divide-y">
        {[
          { t: "Your order ORD-1024 has shipped", d: "2 hours ago" },
          { t: "Restock available: Filtek Universal", d: "1 day ago" },
        ].map((n, i) => (
          <div key={i} className="p-4">
            <div className="text-sm font-medium">{n.t}</div>
            <div className="text-xs text-muted-foreground">{n.d}</div>
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
        <div><Label className="mb-1.5">Full name</Label><Input defaultValue="Dr. Aisha Khan" /></div>
        <div><Label className="mb-1.5">Clinic</Label><Input defaultValue="SmileCare Mumbai" /></div>
        <div className="flex items-center justify-between"><span className="text-sm">Order updates via email</span><Switch defaultChecked /></div>
        <Button onClick={() => toast.success("Saved")}>Save</Button>
      </Card>
    </div>
  );
}
