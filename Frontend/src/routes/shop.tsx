import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  LayoutDashboard, Package, Warehouse, ShoppingBag, Users, BarChart3, Bell, Settings,
  DollarSign, TrendingUp, Plus, FileText, Loader2, Trash2, Edit
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
import { toast } from "sonner";
import {
  shopApi,
  type ShopStats,
  type ShopProduct,
  type ShopInventoryItem,
  type ShopOrder,
  type WeeklySalesItem,
  type MonthlyTrendItem,
  type CategoryShareItem,
  type ProductPerformanceItem,
} from "@/lib/api";

// Categories & brands for the Add Product form
const formCategories = [
  "Composites", "Impression Materials", "Endodontics", "Orthodontics",
  "Instruments", "Disposables", "Cements & Adhesives", "Whitening",
];
const formBrands = ["3M ESPE", "Ivoclar", "Dentsply Sirona", "GC", "Kerr", "Septodont", "VOCO"];

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

// ─── Shared loading / error / empty helpers ─────────────────────────────────

function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
      <Loader2 className="h-8 w-8 animate-spin" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

function ErrorBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
      <p className="text-sm">Failed to load data. Please try again.</p>
      <Button variant="outline" size="sm" onClick={onRetry}>Retry</Button>
    </div>
  );
}

function EmptyBanner({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <p className="text-sm">{label}</p>
    </div>
  );
}

// ─── Generic fetch hook ─────────────────────────────────────────────────────

function useApiData<T>(fetcher: () => Promise<{ data: T }>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetcherRef.current();
      setData(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, retry: load };
}

// ─── Main layout ────────────────────────────────────────────────────────────

function ShopDashboard() {
  const [active, setActive] = useState("dashboard");
  const [search, setSearch] = useState("");

  return (
    <DashboardLayout 
      title="Shop Owner" 
      role="Shop Owner" 
      items={items} 
      active={active} 
      onChange={setActive}
      search={search}
      onSearchChange={setSearch}
    >
      {active === "dashboard" && <DashboardSection />}
      {active === "products" && <ProductsSection search={search} />}
      {active === "inventory" && <InventorySection search={search} />}
      {active === "orders" && <OrdersSection search={search} />}
      {active === "customers" && <CustomersSection search={search} />}
      {active === "analytics" && <AnalyticsSection />}
      {active === "notifications" && <NotificationsSection />}
      {active === "settings" && <SettingsSection />}
    </DashboardLayout>
  );
}

// ─── PAGE 1: Dashboard ──────────────────────────────────────────────────────

function DashboardSection() {
  const stats = useApiData<ShopStats>(shopApi.getStats);
  const weekly = useApiData<WeeklySalesItem[]>(shopApi.getWeeklySales);
  const catShare = useApiData<CategoryShareItem[]>(shopApi.getCategoryShare);
  const monthly = useApiData<MonthlyTrendItem[]>(shopApi.getMonthlyTrend);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground text-sm">Here's how your shop is performing today.</p>
      </div>

      {/* Stat Cards */}
      {stats.loading ? <LoadingSpinner /> : stats.error ? <ErrorBanner onRetry={stats.retry} /> : stats.data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Sales" value={stats.data.totalSales.toLocaleString()} prefix="₹" change={stats.data.weeklyChanges.sales} icon={DollarSign} />
          <StatCard label="Revenue" value={stats.data.revenue.toLocaleString()} prefix="₹" change={stats.data.weeklyChanges.revenue} icon={TrendingUp} />
          <StatCard label="Orders" value={String(stats.data.orders)} change={stats.data.weeklyChanges.orders} icon={ShoppingBag} />
          <StatCard label="Customers" value={String(stats.data.customers)} change={stats.data.weeklyChanges.customers} icon={Users} />
        </div>
      )}

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold mb-4">Weekly sales</h3>
          {weekly.loading ? <LoadingSpinner /> : weekly.error ? <ErrorBanner onRetry={weekly.retry} /> : !weekly.data?.length ? <EmptyBanner label="No sales data yet" /> : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
                  <Bar dataKey="sales" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Category share</h3>
          {catShare.loading ? <LoadingSpinner /> : catShare.error ? <ErrorBanner onRetry={catShare.retry} /> : !catShare.data?.length ? <EmptyBanner label="No products yet" /> : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={catShare.data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                    {catShare.data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Monthly trend */}
      <Card className="p-5">
        <h3 className="font-semibold mb-4">Monthly sales trend</h3>
        {monthly.loading ? <LoadingSpinner /> : monthly.error ? <ErrorBanner onRetry={monthly.retry} /> : !monthly.data?.length ? <EmptyBanner label="No sales data yet" /> : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly.data}>
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
        )}
      </Card>
    </div>
  );
}

// ─── PAGE 2: Products ───────────────────────────────────────────────────────

function ProductForm({ onClose, onSuccess, initialData }: { onClose: () => void, onSuccess: () => void, initialData?: any }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      brand: formData.get("brand") as string,
      price: Number(formData.get("price")),
      sellingPrice: Number(formData.get("price")), // mapping Price to sellingPrice
      purchasePrice: Number(formData.get("purchasePrice") || formData.get("price")),
      stock: Number(formData.get("stock")),
      SKU: formData.get("SKU") as string,
      hsnCode: formData.get("hsnCode") as string,
      gstPercentage: Number(formData.get("gstPercentage") || 0),
      batchNumber: formData.get("batchNumber") as string,
      description: formData.get("description") as string,
    };

    setLoading(true);
    try {
      if (initialData) {
        await shopApi.updateProduct(initialData._id, payload);
        toast.success("Product updated successfully!");
      } else {
        await shopApi.createProduct(payload);
        toast.success("Product created successfully!");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || (initialData ? "Failed to update product" : "Failed to create product"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto px-1 pb-1" onSubmit={handleSubmit}>
      <div className="col-span-2"><Label className="mb-1.5">Name *</Label><Input name="name" defaultValue={initialData?.name} required /></div>
      <div>
        <Label className="mb-1.5">Category *</Label>
        <Select name="category" required defaultValue={initialData?.category || formCategories[0]}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>{formCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label className="mb-1.5">Brand</Label>
        <Select name="brand" defaultValue={initialData?.brand || formBrands[0]}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>{formBrands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div><Label className="mb-1.5">SKU *</Label><Input name="SKU" defaultValue={initialData?.sku || initialData?.SKU} required placeholder="e.g. COMP-001" /></div>
      <div><Label className="mb-1.5">Stock *</Label><Input name="stock" defaultValue={initialData?.stock} type="number" required min="0" /></div>
      
      <div><Label className="mb-1.5">Selling Price (₹) *</Label><Input name="price" defaultValue={initialData?.sellingPrice || initialData?.price} type="number" required min="0" step="0.01" /></div>
      <div><Label className="mb-1.5">Purchase Price (₹)</Label><Input name="purchasePrice" defaultValue={initialData?.purchasePrice} type="number" min="0" step="0.01" /></div>
      
      <div><Label className="mb-1.5">HSN Code</Label><Input name="hsnCode" defaultValue={initialData?.hsnCode} placeholder="e.g. 90184900" /></div>
      <div><Label className="mb-1.5">GST (%)</Label><Input name="gstPercentage" defaultValue={initialData?.gstPercentage} type="number" min="0" max="100" placeholder="e.g. 18" /></div>
      
      <div className="col-span-2"><Label className="mb-1.5">Batch Number</Label><Input name="batchNumber" defaultValue={initialData?.batchNumber} /></div>

      <div className="col-span-2"><Label className="mb-1.5">Description *</Label><Textarea name="description" defaultValue={initialData?.description} rows={3} required /></div>
      
      <div className="col-span-2 flex justify-end gap-2 mt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : (initialData ? "Update Product" : "Save Product")}</Button>
      </div>
    </form>
  );
}

function ProductsSection({ search }: { search?: string }) {
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const { data: products, loading, error, retry } = useApiData<ShopProduct[]>(shopApi.getProducts);

  const filteredProducts = products?.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return p.name.toLowerCase().includes(s) || 
           p.sku?.toLowerCase().includes(s) || 
           p.brand?.toLowerCase().includes(s) || 
           p.category?.toLowerCase().includes(s);
  }) || [];

  const handleEdit = (p: any) => {
    setEditingProduct(p);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setEditingProduct(null), 300);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
          <DialogTrigger asChild><Button onClick={() => setEditingProduct(null)}><Plus className="h-4 w-4 mr-2" />Add Product</Button></DialogTrigger>
          <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{editingProduct ? "Edit Product" : "Add product"}</DialogTitle></DialogHeader><ProductForm initialData={editingProduct} onClose={handleClose} onSuccess={() => retry()} /></DialogContent>
        </Dialog>
      </div>
      {loading ? <LoadingSpinner label="Loading products..." /> : error ? <ErrorBanner onRetry={retry} /> : !filteredProducts.length ? <EmptyBanner label={search ? "No products found matching your search." : "No products yet. Add your first product!"} /> : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Brand</TableHead>
                <TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="flex items-center gap-3 min-w-[220px]">
                    {p.imageUrl && <img src={p.imageUrl} alt="" className="h-9 w-9 rounded object-cover" />}
                    <span className="font-medium">{p.name}</span>
                  </TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>{p.brand}</TableCell>
                  <TableCell>₹{p.price.toFixed(2)}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(p)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={async () => {
                      if (confirm("Are you sure you want to delete this product?")) {
                        try {
                          await shopApi.deleteProduct(p._id);
                          toast.success("Product deleted successfully");
                          retry();
                        } catch (e: any) {
                          toast.error(e.message || "Failed to delete product");
                        }
                      }
                    }}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
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

// ─── PAGE 3: Inventory ──────────────────────────────────────────────────────

function InventorySection({ search }: { search?: string }) {
  const { data: inventory, loading, error, retry } = useApiData<ShopInventoryItem[]>(shopApi.getInventory);

  const filteredInventory = inventory?.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return p.productName.toLowerCase().includes(s) || p.sku?.toLowerCase().includes(s);
  }) || [];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Inventory</h1>
      {loading ? <LoadingSpinner label="Loading inventory..." /> : error ? <ErrorBanner onRetry={retry} /> : !filteredInventory.length ? <EmptyBanner label={search ? "No inventory items found matching your search." : "No inventory data available"} /> : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead><TableHead>Product</TableHead>
                <TableHead>Stock</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                  <TableCell className="font-medium">{p.productName}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell>
                    <StatusBadge status={
                      p.status === "Out of Stock" ? "Cancelled" :
                      p.status === "Low Stock" ? "Pending" : "Active"
                    } />
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

// ─── PAGE 4: Orders ─────────────────────────────────────────────────────────

function OrdersSection({ search }: { search?: string }) {
  const { data: orders, loading, error, retry } = useApiData<ShopOrder[]>(shopApi.getOrders);

  const filteredOrders = orders?.filter((o) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return o.orderId.toLowerCase().includes(s) || 
           o.customerName.toLowerCase().includes(s) || 
           o.customerEmail.toLowerCase().includes(s);
  }) || [];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Orders</h1>
      {loading ? <LoadingSpinner label="Loading orders..." /> : error ? <ErrorBanner onRetry={retry} /> : !filteredOrders.length ? <EmptyBanner label={search ? "No orders found matching your search." : "No orders yet"} /> : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Items</TableHead>
                <TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((o) => (
                <TableRow key={o._id}>
                  <TableCell className="font-mono">{o.orderId}</TableCell>
                  <TableCell>{o.customerName}</TableCell>
                  <TableCell>{o.itemCount}</TableCell>
                  <TableCell>₹{o.total.toFixed(2)}</TableCell>
                  <TableCell><StatusBadge status={o.status as "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled"} /></TableCell>
                  <TableCell className="text-muted-foreground">{o.date}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => {
                      shopApi.getOrderInvoice(o._id)
                        .then(() => toast.success("Invoice downloaded"))
                        .catch(() => toast.error("Failed to download invoice"));
                    }}>
                      <FileText className="h-3.5 w-3.5 mr-1" />Invoice
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

// ─── Customers (unchanged) ──────────────────────────────────────────────────

function CustomersSection({ search }: { search?: string }) {
  const customers = Array.from({ length: 8 }).map((_, i) => ({
    name: ["Dr. A. Khan", "Dr. R. Mehta", "Dr. P. Sharma"][i % 3],
    email: `customer${i + 1}@dental.io`,
    orders: 12 + i * 3,
    spent: (420 + i * 137).toFixed(2),
  }));

  const filteredCustomers = customers.filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Customers</h1>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Orders</TableHead><TableHead>Spent</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No customers found matching your search.</TableCell></TableRow>
            ) : filteredCustomers.map((c, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.email}</TableCell>
                <TableCell>{c.orders}</TableCell>
                <TableCell>₹{c.spent}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// ─── PAGE 5: Analytics ──────────────────────────────────────────────────────

function AnalyticsSection() {
  const perf = useApiData<ProductPerformanceItem[]>(shopApi.getProductPerformance);
  const trend = useApiData<MonthlyTrendItem[]>(shopApi.getMonthlyTrend);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Product performance</h3>
          {perf.loading ? <LoadingSpinner /> : perf.error ? <ErrorBanner onRetry={perf.retry} /> : !perf.data?.length ? <EmptyBanner label="No sales data yet" /> : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perf.data.map((p) => ({ name: p.productName, sales: p.unitsSold }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
                  <Bar dataKey="sales" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold mb-4">Revenue trend</h3>
          {trend.loading ? <LoadingSpinner /> : trend.error ? <ErrorBanner onRetry={trend.retry} /> : !trend.data?.length ? <EmptyBanner label="No revenue data yet" /> : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
                  <Line type="monotone" dataKey="sales" stroke="var(--color-chart-1)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── Notifications (unchanged) ──────────────────────────────────────────────

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

// ─── Settings (unchanged) ───────────────────────────────────────────────────

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
